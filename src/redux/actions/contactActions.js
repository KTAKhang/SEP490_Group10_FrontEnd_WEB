// Contact Actions
export const CONTACT_GET_CATEGORIES_REQUEST = "CONTACT_GET_CATEGORIES_REQUEST";
export const CONTACT_GET_CATEGORIES_SUCCESS = "CONTACT_GET_CATEGORIES_SUCCESS";
export const CONTACT_GET_CATEGORIES_FAILURE = "CONTACT_GET_CATEGORIES_FAILURE";

export const CONTACT_CREATE_CONTACT_REQUEST = "CONTACT_CREATE_CONTACT_REQUEST";
export const CONTACT_CREATE_CONTACT_SUCCESS = "CONTACT_CREATE_CONTACT_SUCCESS";
export const CONTACT_CREATE_CONTACT_FAILURE = "CONTACT_CREATE_CONTACT_FAILURE";

export const CONTACT_GET_MY_CONTACTS_REQUEST = "CONTACT_GET_MY_CONTACTS_REQUEST";
export const CONTACT_GET_MY_CONTACTS_SUCCESS = "CONTACT_GET_MY_CONTACTS_SUCCESS";
export const CONTACT_GET_MY_CONTACTS_FAILURE = "CONTACT_GET_MY_CONTACTS_FAILURE";

export const CONTACT_GET_CONTACT_DETAIL_REQUEST = "CONTACT_GET_CONTACT_DETAIL_REQUEST";
export const CONTACT_GET_CONTACT_DETAIL_SUCCESS = "CONTACT_GET_CONTACT_DETAIL_SUCCESS";
export const CONTACT_GET_CONTACT_DETAIL_FAILURE = "CONTACT_GET_CONTACT_DETAIL_FAILURE";

export const CONTACT_GET_CONTACT_REPLIES_REQUEST = "CONTACT_GET_CONTACT_REPLIES_REQUEST";
export const CONTACT_GET_CONTACT_REPLIES_SUCCESS = "CONTACT_GET_CONTACT_REPLIES_SUCCESS";
export const CONTACT_GET_CONTACT_REPLIES_FAILURE = "CONTACT_GET_CONTACT_REPLIES_FAILURE";

export const CONTACT_SEND_REPLY_REQUEST = "CONTACT_SEND_REPLY_REQUEST";
export const CONTACT_SEND_REPLY_SUCCESS = "CONTACT_SEND_REPLY_SUCCESS";
export const CONTACT_SEND_REPLY_FAILURE = "CONTACT_SEND_REPLY_FAILURE";

export const CONTACT_DOWNLOAD_ATTACHMENT_REQUEST = "CONTACT_DOWNLOAD_ATTACHMENT_REQUEST";
export const CONTACT_DOWNLOAD_ATTACHMENT_SUCCESS = "CONTACT_DOWNLOAD_ATTACHMENT_SUCCESS";
export const CONTACT_DOWNLOAD_ATTACHMENT_FAILURE = "CONTACT_DOWNLOAD_ATTACHMENT_FAILURE";

export const CONTACT_CLEAR_MESSAGES = "CONTACT_CLEAR_MESSAGES";

export const CONTACT_UPDATE_CONTACT_REQUEST = "CONTACT_UPDATE_CONTACT_REQUEST";
export const CONTACT_UPDATE_CONTACT_SUCCESS = "CONTACT_UPDATE_CONTACT_SUCCESS";
export const CONTACT_UPDATE_CONTACT_FAILURE = "CONTACT_UPDATE_CONTACT_FAILURE";

export const CONTACT_UPDATE_REPLY_REQUEST = "CONTACT_UPDATE_REPLY_REQUEST";
export const CONTACT_UPDATE_REPLY_SUCCESS = "CONTACT_UPDATE_REPLY_SUCCESS";
export const CONTACT_UPDATE_REPLY_FAILURE = "CONTACT_UPDATE_REPLY_FAILURE";

export const CONTACT_DELETE_REPLY_REQUEST = "CONTACT_DELETE_REPLY_REQUEST";
export const CONTACT_DELETE_REPLY_SUCCESS = "CONTACT_DELETE_REPLY_SUCCESS";
export const CONTACT_DELETE_REPLY_FAILURE = "CONTACT_DELETE_REPLY_FAILURE";

// Action Creators
export const contactGetCategoriesRequest = () => ({
  type: CONTACT_GET_CATEGORIES_REQUEST,
});

export const contactGetCategoriesSuccess = (categories) => ({
  type: CONTACT_GET_CATEGORIES_SUCCESS,
  payload: categories,
});

export const contactGetCategoriesFailure = (error) => ({
  type: CONTACT_GET_CATEGORIES_FAILURE,
  payload: error,
});

export const contactCreateContactRequest = (formData) => ({
  type: CONTACT_CREATE_CONTACT_REQUEST,
  payload: formData,
});

export const contactCreateContactSuccess = (data) => ({
  type: CONTACT_CREATE_CONTACT_SUCCESS,
  payload: data,
});

export const contactCreateContactFailure = (error) => ({
  type: CONTACT_CREATE_CONTACT_FAILURE,
  payload: error,
});

export const contactGetMyContactsRequest = (params) => ({
  type: CONTACT_GET_MY_CONTACTS_REQUEST,
  payload: params,
});

export const contactGetMyContactsSuccess = (contacts) => ({
  type: CONTACT_GET_MY_CONTACTS_SUCCESS,
  payload: contacts,
});

export const contactGetMyContactsFailure = (error) => ({
  type: CONTACT_GET_MY_CONTACTS_FAILURE,
  payload: error,
});

export const contactGetContactDetailRequest = (contactId) => ({
  type: CONTACT_GET_CONTACT_DETAIL_REQUEST,
  payload: contactId,
});

export const contactGetContactDetailSuccess = (contact) => ({
  type: CONTACT_GET_CONTACT_DETAIL_SUCCESS,
  payload: contact,
});

export const contactGetContactDetailFailure = (error) => ({
  type: CONTACT_GET_CONTACT_DETAIL_FAILURE,
  payload: error,
});

export const contactGetContactRepliesRequest = (contactId) => ({
  type: CONTACT_GET_CONTACT_REPLIES_REQUEST,
  payload: contactId,
});

export const contactGetContactRepliesSuccess = (replies) => ({
  type: CONTACT_GET_CONTACT_REPLIES_SUCCESS,
  payload: replies,
});

export const contactGetContactRepliesFailure = (error) => ({
  type: CONTACT_GET_CONTACT_REPLIES_FAILURE,
  payload: error,
});

export const contactSendReplyRequest = (contactId, message) => ({
  type: CONTACT_SEND_REPLY_REQUEST,
  payload: { contactId, message },
});

export const contactSendReplySuccess = (data) => ({
  type: CONTACT_SEND_REPLY_SUCCESS,
  payload: data,
});

export const contactSendReplyFailure = (error) => ({
  type: CONTACT_SEND_REPLY_FAILURE,
  payload: error,
});

export const contactDownloadAttachmentRequest = (fileUrl, fileName) => ({
  type: CONTACT_DOWNLOAD_ATTACHMENT_REQUEST,
  payload: { fileUrl, fileName },
});

export const contactDownloadAttachmentSuccess = () => ({
  type: CONTACT_DOWNLOAD_ATTACHMENT_SUCCESS,
});

export const contactDownloadAttachmentFailure = (error) => ({
  type: CONTACT_DOWNLOAD_ATTACHMENT_FAILURE,
  payload: error,
});

export const contactClearMessages = () => ({
  type: CONTACT_CLEAR_MESSAGES,
});

export const contactUpdateContactRequest = (contactId, data) => ({
  type: CONTACT_UPDATE_CONTACT_REQUEST,
  payload: { contactId, data },
});

export const contactUpdateContactSuccess = (data) => ({
  type: CONTACT_UPDATE_CONTACT_SUCCESS,
  payload: data,
});

export const contactUpdateContactFailure = (error) => ({
  type: CONTACT_UPDATE_CONTACT_FAILURE,
  payload: error,
});

export const contactUpdateReplyRequest = (contactId, replyId, message) => ({
  type: CONTACT_UPDATE_REPLY_REQUEST,
  payload: { contactId, replyId, message },
});

export const contactUpdateReplySuccess = (data) => ({
  type: CONTACT_UPDATE_REPLY_SUCCESS,
  payload: data,
});

export const contactUpdateReplyFailure = (error) => ({
  type: CONTACT_UPDATE_REPLY_FAILURE,
  payload: error,
});

export const contactDeleteReplyRequest = (contactId, replyId) => ({
  type: CONTACT_DELETE_REPLY_REQUEST,
  payload: { contactId, replyId },
});

export const contactDeleteReplySuccess = (data) => ({
  type: CONTACT_DELETE_REPLY_SUCCESS,
  payload: data,
});

export const contactDeleteReplyFailure = (error) => ({
  type: CONTACT_DELETE_REPLY_FAILURE,
  payload: error,
});
