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
} from "../actions/contactActions";
import apiClient from "../../utils/axiosConfig";

// Categories are priority levels enum, no API endpoint needed
// Backend uses: ["LOW", "MEDIUM", "HIGH", "URGENT"]
const CATEGORIES = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "URGENT", label: "Khẩn cấp" },
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

// Saga for getting categories (no API call, return static enum)
function* getCategoriesSaga() {
  try {
    // Categories are priority levels enum from backend
    yield put(getCategoriesSuccess(CATEGORIES));
  } catch (error) {
    console.error("Error getting categories:", error);
    yield put(getCategoriesFailure(error.message));
  }
}

// Saga for creating contact
function* createContactSaga(action) {
  try {
    const { subject, message, category, files } = action.payload;
    
    // Step 1: Create contact without attachments
    const response = yield call(apiCreateContact, { subject, message, category });

    if (response.status === "OK" && response.data) {
      const contactId = response.data._id || response.data.id;
      
      // Step 2: Upload attachments if any (one by one)
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            yield call(apiUploadAttachment, contactId, file);
          } catch (uploadError) {
            console.error("Error uploading attachment:", uploadError);
            // Continue with other files even if one fails
          }
        }
      }
      
      yield put(createContactSuccess(response));
      toast.success(
        response.message || "Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể."
      );
    } else {
      throw new Error(response.message || "Có lỗi xảy ra khi gửi liên hệ");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.";
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
      "Không thể tải lịch sử liên hệ";
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
      throw new Error(response.message || "Không thể tải chi tiết liên hệ");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể tải chi tiết liên hệ";
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
      "Không thể tải phản hồi";
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
      toast.success(response.message || "Gửi phản hồi thành công");
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
      throw new Error(response.message || "Có lỗi xảy ra khi gửi phản hồi");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Có lỗi xảy ra khi gửi phản hồi";
    yield put(sendReplyFailure(errorMessage));
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
    toast.success("Tải file thành công");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể tải file đính kèm";
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
  yield takeLatest(DOWNLOAD_ATTACHMENT_REQUEST, downloadAttachmentSaga);
}
