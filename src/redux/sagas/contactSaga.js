// sagas/contactSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  GET_CATEGORIES_REQUEST,
  getCategoriesSuccess,
  getCategoriesFailure,
  CREATE_CONTACT_REQUEST,
  createContactSuccess,
  createContactFailure,
  GET_MY_CONTACTS_REQUEST,
  getMyContactsSuccess,
  getMyContactsFailure,
  GET_CONTACT_DETAIL_REQUEST,
  getContactDetailSuccess,
  getContactDetailFailure,
  GET_CONTACT_REPLIES_REQUEST,
  getContactRepliesSuccess,
  getContactRepliesFailure,
  SEND_REPLY_REQUEST,
  sendReplySuccess,
  sendReplyFailure,
  DOWNLOAD_ATTACHMENT_REQUEST,
  downloadAttachmentSuccess,
  downloadAttachmentFailure,
  UPDATE_CONTACT_REQUEST,
  updateContactSuccess,
  updateContactFailure,
  UPDATE_REPLY_REQUEST,
  updateReplySuccess,
  updateReplyFailure,
  DELETE_REPLY_REQUEST,
  deleteReplySuccess,
  deleteReplyFailure,
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
function* getCategoriesSaga() {
  try {
    yield put(getCategoriesSuccess(CATEGORIES));
  } catch (error) {
    console.error("Error getting categories:", error);
    yield put(getCategoriesFailure(error.message));
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
function* createContactSaga(action) {
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
      
      yield put(createContactSuccess(response));
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
    yield put(createContactFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting my contacts
function* getMyContactsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetMyContacts, params);
    if (response.status === "OK" && response.data) {
      yield put(getMyContactsSuccess(response.data));
    } else {
      yield put(getMyContactsSuccess([]));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load contact history";
    yield put(getMyContactsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting contact detail
function* getContactDetailSaga(action) {
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
      
      yield put(getContactDetailSuccess(contact));
      yield put(getContactRepliesSuccess(replies));
    } else {
      throw new Error(response.message || "Unable to load contact details");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load contact details";
    yield put(getContactDetailFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for getting contact replies
function* getContactRepliesSaga(action) {
  try {
    const contactId = action.payload;
    const response = yield call(apiGetContactReplies, contactId);
    if (response.status === "OK" && response.data) {
      yield put(getContactRepliesSuccess(response.data));
    } else {
      yield put(getContactRepliesSuccess([]));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to load replies";
    yield put(getContactRepliesFailure(errorMessage));
  }
}

// Saga for sending reply
function* sendReplySaga(action) {
  try {
    const { contactId, message } = action.payload;
    const response = yield call(apiSendReply, contactId, message);

    if (response.status === "OK") {
      yield put(sendReplySuccess(response));
      toast.success(response.message || "Reply sent successfully");
      // Refresh replies after sending
      yield put({
        type: GET_CONTACT_REPLIES_REQUEST,
        payload: contactId,
      });
      // Refresh contacts list to update updated_at
      yield put({
        type: GET_MY_CONTACTS_REQUEST,
      });
    } else {
      throw new Error(response.message || "An error occurred while sending reply");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while sending reply";
    yield put(sendReplyFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for updating contact
function* updateContactSaga(action) {
  try {
    const { contactId, data } = action.payload;
    const response = yield call(apiUpdateContact, contactId, data);

    if (response.status === "OK") {
      yield put(updateContactSuccess(response.data));
      toast.success(response.message || "Contact updated successfully");
      // Refresh contact detail after update
      yield put({
        type: GET_CONTACT_DETAIL_REQUEST,
        payload: contactId,
      });
      // Refresh contacts list
      yield put({
        type: GET_MY_CONTACTS_REQUEST,
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
    yield put(updateContactFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for updating reply
function* updateReplySaga(action) {
  try {
    const { contactId, replyId, message } = action.payload;
    const response = yield call(apiUpdateReply, contactId, replyId, message);

    if (response.status === "OK") {
      yield put(updateReplySuccess(response.data));
      toast.success(response.message || "Reply updated successfully");
      // Refresh replies after update
      yield put({
        type: GET_CONTACT_REPLIES_REQUEST,
        payload: contactId,
      });
      // Refresh contact detail
      yield put({
        type: GET_CONTACT_DETAIL_REQUEST,
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
    yield put(updateReplyFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for deleting reply
function* deleteReplySaga(action) {
  try {
    const { contactId, replyId } = action.payload;
    const response = yield call(apiDeleteReply, contactId, replyId);

    if (response.status === "OK") {
      yield put(deleteReplySuccess(response.data));
      toast.success(response.message || "Reply deleted successfully");
      // Refresh replies after delete
      yield put({
        type: GET_CONTACT_REPLIES_REQUEST,
        payload: contactId,
      });
      // Refresh contact detail
      yield put({
        type: GET_CONTACT_DETAIL_REQUEST,
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
    yield put(deleteReplyFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Saga for downloading attachment
function* downloadAttachmentSaga(action) {
  try {
    const { fileUrl, fileName } = action.payload;
    
    // Use Cloudinary URL directly
    yield call(downloadAttachmentFromUrl, fileUrl, fileName);
    
    yield put(downloadAttachmentSuccess());
    toast.success("File downloaded successfully");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unable to download attachment";
    yield put(downloadAttachmentFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Root saga
export default function* contactSaga() {
  yield takeLatest(GET_CATEGORIES_REQUEST, getCategoriesSaga);
  yield takeLatest(CREATE_CONTACT_REQUEST, createContactSaga);
  yield takeLatest(GET_MY_CONTACTS_REQUEST, getMyContactsSaga);
  yield takeLatest(GET_CONTACT_DETAIL_REQUEST, getContactDetailSaga);
  yield takeLatest(GET_CONTACT_REPLIES_REQUEST, getContactRepliesSaga);
  yield takeLatest(SEND_REPLY_REQUEST, sendReplySaga);
  yield takeLatest(UPDATE_CONTACT_REQUEST, updateContactSaga);
  yield takeLatest(UPDATE_REPLY_REQUEST, updateReplySaga);
  yield takeLatest(DELETE_REPLY_REQUEST, deleteReplySaga);
  yield takeLatest(DOWNLOAD_ATTACHMENT_REQUEST, downloadAttachmentSaga);
}
