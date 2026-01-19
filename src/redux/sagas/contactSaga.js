// sagas/contactSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  CONTACT_GET_CATEGORIES_REQUEST,
  contactGetCategoriesSuccess,
  contactGetCategoriesFailure,
  CONTACT_CREATE_CONTACT_REQUEST,
  contactCreateContactSuccess,
  contactCreateContactFailure,
  CONTACT_GET_MY_CONTACTS_REQUEST,
  contactGetMyContactsSuccess,
  contactGetMyContactsFailure,
  CONTACT_GET_CONTACT_DETAIL_REQUEST,
  contactGetContactDetailSuccess,
  contactGetContactDetailFailure,
  CONTACT_GET_CONTACT_REPLIES_REQUEST,
  contactGetContactRepliesSuccess,
  contactGetContactRepliesFailure,
  CONTACT_SEND_REPLY_REQUEST,
  contactSendReplySuccess,
  contactSendReplyFailure,
  CONTACT_DOWNLOAD_ATTACHMENT_REQUEST,
  contactDownloadAttachmentSuccess,
  contactDownloadAttachmentFailure,
  CONTACT_UPDATE_CONTACT_REQUEST,
  contactUpdateContactSuccess,
  contactUpdateContactFailure,
  CONTACT_UPDATE_REPLY_REQUEST,
  contactUpdateReplySuccess,
  contactUpdateReplyFailure,
  CONTACT_DELETE_REPLY_REQUEST,
  contactDeleteReplySuccess,
  contactDeleteReplyFailure,
} from "../actions/contactActions";
import apiClient from "../../utils/axiosConfig";

// Categories for contact, no API endpoint needed
const CATEGORIES = [
  { value: "products", label: "Products" },
  { value: "warranty", label: "Warranty" },
  { value: "policies", label: "Policies" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

// API call for creating contact (without attachments)
const apiCreateContact = async ({ subject, message, category }) => {
  const response = await apiClient.post("/contacts", {
    subject,
    message,
    category,
  });
  return response.data;
};

// API call for uploading attachment to contact
const apiUploadAttachment = async (contactId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiClient.post(`/contacts/${contactId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// API call for getting my contacts (with pagination and filters)
const apiGetMyContacts = async ({ page = 1, limit = 10, status, category } = {}) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (status) params.append("status", status);
  if (category) params.append("category", category);
  
  const response = await apiClient.get(`/contacts?${params.toString()}`);
  return response.data;
};

// API call for getting contact detail
const apiGetContactDetail = async (contactId) => {
  const response = await apiClient.get(`/contacts/${contactId}`);
  return response.data;
};

// API call for getting contact replies
const apiGetContactReplies = async (contactId) => {
  const response = await apiClient.get(`/contacts/${contactId}/replies`);
  return response.data;
};

// API call for sending reply
const apiSendReply = async (contactId, message) => {
  const response = await apiClient.post(`/contacts/${contactId}/replies`, {
    message: message.trim(),
    sender_type: "USER",
  });
  return response.data;
};

// API call for updating contact status
// Backend uses PATCH /contacts/:id/status for updating contact status
const apiUpdateContact = async (contactId, data) => {
  const response = await apiClient.patch(`/contacts/${contactId}/status`, data);
  return response.data;
};

// API call for updating reply
const apiUpdateReply = async (contactId, replyId, message) => {
  const response = await apiClient.put(`/contacts/${contactId}/replies/${replyId}`, {
    message: message.trim(),
  });
  return response.data;
};

// API call for deleting reply
const apiDeleteReply = async (contactId, replyId) => {
  const response = await apiClient.delete(`/contacts/${contactId}/replies/${replyId}`);
  return response.data;
};

// Download attachment using Cloudinary URL (no API endpoint needed)
const downloadAttachmentFromUrl = async (fileUrl, fileName) => {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Saga for getting categories (no API call, return static categories)
function* contactGetCategoriesSaga() {
  try {
    yield put(contactGetCategoriesSuccess(CATEGORIES));
  } catch (error) {
    console.error("Error getting categories:", error);
    yield put(contactGetCategoriesFailure(error.message));
  }
}

// Helper function to compress image
const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve) => {
    // Only compress if it's an image
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              // Only use compressed version if it's smaller
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // If compression didn't help, use original
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file); // Fallback to original on error
    reader.readAsDataURL(file);
  });
};

// Saga for creating contact
function* contactCreateContactSaga(action) {
  try {
    const { subject, message, category, files } = action.payload;
    
    // Step 1: Create contact without attachments
    const response = yield call(apiCreateContact, { subject, message, category });

    if (response.status === "OK" && response.data) {
      const contactId = response.data._id || response.data.id;
      
      // Step 2: Upload attachments in parallel (much faster)
      if (files && files.length > 0) {
        try {
          // Compress images first (in parallel)
          const compressedFiles = yield Promise.all(
            files.map(file => compressImage(file))
          );

          // Upload all files in parallel
          yield Promise.all(
            compressedFiles.map(file => 
              apiUploadAttachment(contactId, file).catch(error => {
                console.error("Error uploading attachment:", error);
                // Continue with other files even if one fails
                return null;
              })
            )
          );
        } catch (uploadError) {
          console.error("Error during attachment upload:", uploadError);
          // Don't fail the whole request if attachments fail
        }
      }
      
      yield put(contactCreateContactSuccess(response));
      toast.success(
        response.message || "Contact sent successfully! We will respond as soon as possible."
      );
    } else {
      throw new Error(response.message || "An error occurred while sending contact");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while sending contact. Please try again.";
    yield put(contactCreateContactFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting my contacts
function* contactGetMyContactsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetMyContacts, params);
    if (response.status === "OK" && response.data) {
      yield put(contactGetMyContactsSuccess(response.data));
    } else {
      yield put(contactGetMyContactsSuccess([]));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load contact history";
    yield put(contactGetMyContactsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting contact detail
function* contactGetContactDetailSaga(action) {
  try {
    const contactId = action.payload;
    const response = yield call(apiGetContactDetail, contactId);
    if (response.status === "OK" && response.data) {
      // Backend returns contact with replies and attachments already included
      const contactData = response.data;
      
      // Separate replies and attachments from contact
      const replies = contactData.replies || [];
      const attachments = contactData.attachments || [];
      
      // Keep attachments in contact object for display
      const contact = {
        ...contactData,
        attachments: attachments,
      };
      
      yield put(contactGetContactDetailSuccess(contact));
      yield put(contactGetContactRepliesSuccess(replies));
    } else {
      throw new Error(response.message || "Unable to load contact details");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load contact details";
    yield put(contactGetContactDetailFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting contact replies
function* contactGetContactRepliesSaga(action) {
  try {
    const contactId = action.payload;
    const response = yield call(apiGetContactReplies, contactId);
    if (response.status === "OK" && response.data) {
      yield put(contactGetContactRepliesSuccess(response.data));
    } else {
      yield put(contactGetContactRepliesSuccess([]));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load replies";
    yield put(contactGetContactRepliesFailure(errorMessage));
  }
}

// Saga for sending reply
function* contactSendReplySaga(action) {
  try {
    const { contactId, message } = action.payload;
    const response = yield call(apiSendReply, contactId, message);

    if (response.status === "OK") {
      yield put(contactSendReplySuccess(response));
      toast.success(response.message || "Reply sent successfully");
      // Refresh replies after sending
      yield put({
        type: CONTACT_GET_CONTACT_REPLIES_REQUEST,
        payload: contactId,
      });
      // Refresh contacts list to update updated_at
      yield put({
        type: CONTACT_GET_MY_CONTACTS_REQUEST,
      });
    } else {
      throw new Error(response.message || "An error occurred while sending reply");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while sending reply";
    yield put(contactSendReplyFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for updating contact
function* contactUpdateContactSaga(action) {
  try {
    const { contactId, data } = action.payload;
    const response = yield call(apiUpdateContact, contactId, data);

    if (response.status === "OK") {
      yield put(contactUpdateContactSuccess(response.data));
      toast.success(response.message || "Contact updated successfully");
      // Refresh contact detail after update
      yield put({
        type: CONTACT_GET_CONTACT_DETAIL_REQUEST,
        payload: contactId,
      });
      // Refresh contacts list
      yield put({
        type: CONTACT_GET_MY_CONTACTS_REQUEST,
        payload: {},
      });
    } else {
      throw new Error(response.message || "An error occurred while updating contact");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while updating contact";
    yield put(contactUpdateContactFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for updating reply
function* contactUpdateReplySaga(action) {
  try {
    const { contactId, replyId, message } = action.payload;
    const response = yield call(apiUpdateReply, contactId, replyId, message);

    if (response.status === "OK") {
      yield put(contactUpdateReplySuccess(response.data));
      toast.success(response.message || "Reply updated successfully");
      // Refresh replies after update
      yield put({
        type: CONTACT_GET_CONTACT_REPLIES_REQUEST,
        payload: contactId,
      });
      // Refresh contact detail
      yield put({
        type: CONTACT_GET_CONTACT_DETAIL_REQUEST,
        payload: contactId,
      });
    } else {
      throw new Error(response.message || "An error occurred while updating reply");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while updating reply";
    yield put(contactUpdateReplyFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for deleting reply
function* contactDeleteReplySaga(action) {
  try {
    const { contactId, replyId } = action.payload;
    const response = yield call(apiDeleteReply, contactId, replyId);

    if (response.status === "OK") {
      yield put(contactDeleteReplySuccess(response.data));
      toast.success(response.message || "Reply deleted successfully");
      // Refresh replies after delete
      yield put({
        type: CONTACT_GET_CONTACT_REPLIES_REQUEST,
        payload: contactId,
      });
      // Refresh contact detail
      yield put({
        type: CONTACT_GET_CONTACT_DETAIL_REQUEST,
        payload: contactId,
      });
    } else {
      throw new Error(response.message || "An error occurred while deleting reply");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while deleting reply";
    yield put(contactDeleteReplyFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for downloading attachment
function* contactDownloadAttachmentSaga(action) {
  try {
    const { fileUrl, fileName } = action.payload;
    
    // Use Cloudinary URL directly
    yield call(downloadAttachmentFromUrl, fileUrl, fileName);
    
    yield put(contactDownloadAttachmentSuccess());
    toast.success("File downloaded successfully");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to download attachment";
    yield put(contactDownloadAttachmentFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Root saga
export default function* contactSaga() {
  yield takeLatest(CONTACT_GET_CATEGORIES_REQUEST, contactGetCategoriesSaga);
  yield takeLatest(CONTACT_CREATE_CONTACT_REQUEST, contactCreateContactSaga);
  yield takeLatest(CONTACT_GET_MY_CONTACTS_REQUEST, contactGetMyContactsSaga);
  yield takeLatest(CONTACT_GET_CONTACT_DETAIL_REQUEST, contactGetContactDetailSaga);
  yield takeLatest(CONTACT_GET_CONTACT_REPLIES_REQUEST, contactGetContactRepliesSaga);
  yield takeLatest(CONTACT_SEND_REPLY_REQUEST, contactSendReplySaga);
  yield takeLatest(CONTACT_UPDATE_CONTACT_REQUEST, contactUpdateContactSaga);
  yield takeLatest(CONTACT_UPDATE_REPLY_REQUEST, contactUpdateReplySaga);
  yield takeLatest(CONTACT_DELETE_REPLY_REQUEST, contactDeleteReplySaga);
  yield takeLatest(CONTACT_DOWNLOAD_ATTACHMENT_REQUEST, contactDownloadAttachmentSaga);
}
