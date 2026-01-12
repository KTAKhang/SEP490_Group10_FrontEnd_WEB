// Contact Actions
export const GET_CATEGORIES_REQUEST = "GET_CATEGORIES_REQUEST";
export const GET_CATEGORIES_SUCCESS = "GET_CATEGORIES_SUCCESS";
export const GET_CATEGORIES_FAILURE = "GET_CATEGORIES_FAILURE";

export const CREATE_CONTACT_REQUEST = "CREATE_CONTACT_REQUEST";
export const CREATE_CONTACT_SUCCESS = "CREATE_CONTACT_SUCCESS";
export const CREATE_CONTACT_FAILURE = "CREATE_CONTACT_FAILURE";

export const GET_MY_CONTACTS_REQUEST = "GET_MY_CONTACTS_REQUEST";
export const GET_MY_CONTACTS_SUCCESS = "GET_MY_CONTACTS_SUCCESS";
export const GET_MY_CONTACTS_FAILURE = "GET_MY_CONTACTS_FAILURE";

export const GET_CONTACT_DETAIL_REQUEST = "GET_CONTACT_DETAIL_REQUEST";
export const GET_CONTACT_DETAIL_SUCCESS = "GET_CONTACT_DETAIL_SUCCESS";
export const GET_CONTACT_DETAIL_FAILURE = "GET_CONTACT_DETAIL_FAILURE";

export const GET_CONTACT_REPLIES_REQUEST = "GET_CONTACT_REPLIES_REQUEST";
export const GET_CONTACT_REPLIES_SUCCESS = "GET_CONTACT_REPLIES_SUCCESS";
export const GET_CONTACT_REPLIES_FAILURE = "GET_CONTACT_REPLIES_FAILURE";

export const SEND_REPLY_REQUEST = "SEND_REPLY_REQUEST";
export const SEND_REPLY_SUCCESS = "SEND_REPLY_SUCCESS";
export const SEND_REPLY_FAILURE = "SEND_REPLY_FAILURE";

export const DOWNLOAD_ATTACHMENT_REQUEST = "DOWNLOAD_ATTACHMENT_REQUEST";
export const DOWNLOAD_ATTACHMENT_SUCCESS = "DOWNLOAD_ATTACHMENT_SUCCESS";
export const DOWNLOAD_ATTACHMENT_FAILURE = "DOWNLOAD_ATTACHMENT_FAILURE";

export const CLEAR_CONTACT_MESSAGES = "CLEAR_CONTACT_MESSAGES";

export const UPDATE_CONTACT_REQUEST = "UPDATE_CONTACT_REQUEST";
export const UPDATE_CONTACT_SUCCESS = "UPDATE_CONTACT_SUCCESS";
export const UPDATE_CONTACT_FAILURE = "UPDATE_CONTACT_FAILURE";

export const UPDATE_REPLY_REQUEST = "UPDATE_REPLY_REQUEST";
export const UPDATE_REPLY_SUCCESS = "UPDATE_REPLY_SUCCESS";
export const UPDATE_REPLY_FAILURE = "UPDATE_REPLY_FAILURE";

export const DELETE_REPLY_REQUEST = "DELETE_REPLY_REQUEST";
export const DELETE_REPLY_SUCCESS = "DELETE_REPLY_SUCCESS";
export const DELETE_REPLY_FAILURE = "DELETE_REPLY_FAILURE";

// Action Creators
export const getCategoriesRequest = () => ({
  type: GET_CATEGORIES_REQUEST,
});

export const getCategoriesSuccess = (categories) => ({
  type: GET_CATEGORIES_SUCCESS,
  payload: categories,
});

export const getCategoriesFailure = (error) => ({
  type: GET_CATEGORIES_FAILURE,
  payload: error,
});

export const createContactRequest = (formData) => ({
  type: CREATE_CONTACT_REQUEST,
  payload: formData,
});

export const createContactSuccess = (data) => ({
  type: CREATE_CONTACT_SUCCESS,
  payload: data,
});

export const createContactFailure = (error) => ({
  type: CREATE_CONTACT_FAILURE,
  payload: error,
});

export const getMyContactsRequest = (params) => ({
  type: GET_MY_CONTACTS_REQUEST,
  payload: params,
});

export const getMyContactsSuccess = (contacts) => ({
  type: GET_MY_CONTACTS_SUCCESS,
  payload: contacts,
});

export const getMyContactsFailure = (error) => ({
  type: GET_MY_CONTACTS_FAILURE,
  payload: error,
});

export const getContactDetailRequest = (contactId) => ({
  type: GET_CONTACT_DETAIL_REQUEST,
  payload: contactId,
});

export const getContactDetailSuccess = (contact) => ({
  type: GET_CONTACT_DETAIL_SUCCESS,
  payload: contact,
});

export const getContactDetailFailure = (error) => ({
  type: GET_CONTACT_DETAIL_FAILURE,
  payload: error,
});

export const getContactRepliesRequest = (contactId) => ({
  type: GET_CONTACT_REPLIES_REQUEST,
  payload: contactId,
});

export const getContactRepliesSuccess = (replies) => ({
  type: GET_CONTACT_REPLIES_SUCCESS,
  payload: replies,
});

export const getContactRepliesFailure = (error) => ({
  type: GET_CONTACT_REPLIES_FAILURE,
  payload: error,
});

export const sendReplyRequest = (contactId, message) => ({
  type: SEND_REPLY_REQUEST,
  payload: { contactId, message },
});

export const sendReplySuccess = (data) => ({
  type: SEND_REPLY_SUCCESS,
  payload: data,
});

export const sendReplyFailure = (error) => ({
  type: SEND_REPLY_FAILURE,
  payload: error,
});

export const downloadAttachmentRequest = (fileUrl, fileName) => ({
  type: DOWNLOAD_ATTACHMENT_REQUEST,
  payload: { fileUrl, fileName },
});

export const downloadAttachmentSuccess = () => ({
  type: DOWNLOAD_ATTACHMENT_SUCCESS,
});

export const downloadAttachmentFailure = (error) => ({
  type: DOWNLOAD_ATTACHMENT_FAILURE,
  payload: error,
});

export const clearContactMessages = () => ({
  type: CLEAR_CONTACT_MESSAGES,
});

export const updateContactRequest = (contactId, data) => ({
  type: UPDATE_CONTACT_REQUEST,
  payload: { contactId, data },
});

export const updateContactSuccess = (data) => ({
  type: UPDATE_CONTACT_SUCCESS,
  payload: data,
});

export const updateContactFailure = (error) => ({
  type: UPDATE_CONTACT_FAILURE,
  payload: error,
});

export const updateReplyRequest = (contactId, replyId, message) => ({
  type: UPDATE_REPLY_REQUEST,
  payload: { contactId, replyId, message },
});

export const updateReplySuccess = (data) => ({
  type: UPDATE_REPLY_SUCCESS,
  payload: data,
});

export const updateReplyFailure = (error) => ({
  type: UPDATE_REPLY_FAILURE,
  payload: error,
});

export const deleteReplyRequest = (contactId, replyId) => ({
  type: DELETE_REPLY_REQUEST,
  payload: { contactId, replyId },
});

export const deleteReplySuccess = (data) => ({
  type: DELETE_REPLY_SUCCESS,
  payload: data,
});

export const deleteReplyFailure = (error) => ({
  type: DELETE_REPLY_FAILURE,
  payload: error,
});
