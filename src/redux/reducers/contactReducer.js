import {
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAILURE,
  CREATE_CONTACT_REQUEST,
  CREATE_CONTACT_SUCCESS,
  CREATE_CONTACT_FAILURE,
  GET_MY_CONTACTS_REQUEST,
  GET_MY_CONTACTS_SUCCESS,
  GET_MY_CONTACTS_FAILURE,
  GET_CONTACT_DETAIL_REQUEST,
  GET_CONTACT_DETAIL_SUCCESS,
  GET_CONTACT_DETAIL_FAILURE,
  GET_CONTACT_REPLIES_REQUEST,
  GET_CONTACT_REPLIES_SUCCESS,
  GET_CONTACT_REPLIES_FAILURE,
  SEND_REPLY_REQUEST,
  SEND_REPLY_SUCCESS,
  SEND_REPLY_FAILURE,
  DOWNLOAD_ATTACHMENT_REQUEST,
  DOWNLOAD_ATTACHMENT_SUCCESS,
  DOWNLOAD_ATTACHMENT_FAILURE,
  CLEAR_CONTACT_MESSAGES,
} from "../actions/contactActions";

const initialState = {
  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  // Create Contact
  createContactLoading: false,
  createContactSuccess: false,
  createContactError: null,
  createContactMessage: null,

  // My Contacts List
  contacts: [],
  contactsLoading: false,
  contactsError: null,

  // Contact Detail
  contactDetail: null,
  contactDetailLoading: false,
  contactDetailError: null,

  // Replies
  replies: [],
  repliesLoading: false,
  repliesError: null,

  // Send Reply
  sendReplyLoading: false,
  sendReplySuccess: false,
  sendReplyError: null,

  // Download Attachment
  downloadAttachmentLoading: false,
  downloadAttachmentError: null,
};

const contactReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== GET CATEGORIES =====
    case GET_CATEGORIES_REQUEST:
      return {
        ...state,
        categoriesLoading: true,
        categoriesError: null,
      };
    case GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload,
        categoriesLoading: false,
        categoriesError: null,
      };
    case GET_CATEGORIES_FAILURE:
      return {
        ...state,
        categoriesLoading: false,
        categoriesError: action.payload,
      };

    // ===== CREATE CONTACT =====
    case CREATE_CONTACT_REQUEST:
      return {
        ...state,
        createContactLoading: true,
        createContactSuccess: false,
        createContactError: null,
        createContactMessage: null,
      };
    case CREATE_CONTACT_SUCCESS:
      return {
        ...state,
        createContactLoading: false,
        createContactSuccess: true,
        createContactError: null,
        createContactMessage: action.payload.message || "Gửi liên hệ thành công",
      };
    case CREATE_CONTACT_FAILURE:
      return {
        ...state,
        createContactLoading: false,
        createContactSuccess: false,
        createContactError: action.payload,
        createContactMessage: null,
      };

    // ===== GET MY CONTACTS =====
    case GET_MY_CONTACTS_REQUEST:
      return {
        ...state,
        contactsLoading: true,
        contactsError: null,
      };
    case GET_MY_CONTACTS_SUCCESS:
      return {
        ...state,
        contacts: action.payload,
        contactsLoading: false,
        contactsError: null,
      };
    case GET_MY_CONTACTS_FAILURE:
      return {
        ...state,
        contactsLoading: false,
        contactsError: action.payload,
      };

    // ===== GET CONTACT DETAIL =====
    case GET_CONTACT_DETAIL_REQUEST:
      return {
        ...state,
        contactDetailLoading: true,
        contactDetailError: null,
      };
    case GET_CONTACT_DETAIL_SUCCESS:
      return {
        ...state,
        contactDetail: action.payload,
        contactDetailLoading: false,
        contactDetailError: null,
      };
    case GET_CONTACT_DETAIL_FAILURE:
      return {
        ...state,
        contactDetailLoading: false,
        contactDetailError: action.payload,
      };

    // ===== GET CONTACT REPLIES =====
    case GET_CONTACT_REPLIES_REQUEST:
      return {
        ...state,
        repliesLoading: true,
        repliesError: null,
      };
    case GET_CONTACT_REPLIES_SUCCESS:
      return {
        ...state,
        replies: action.payload,
        repliesLoading: false,
        repliesError: null,
      };
    case GET_CONTACT_REPLIES_FAILURE:
      return {
        ...state,
        repliesLoading: false,
        repliesError: action.payload,
      };

    // ===== SEND REPLY =====
    case SEND_REPLY_REQUEST:
      return {
        ...state,
        sendReplyLoading: true,
        sendReplySuccess: false,
        sendReplyError: null,
      };
    case SEND_REPLY_SUCCESS:
      return {
        ...state,
        sendReplyLoading: false,
        sendReplySuccess: true,
        sendReplyError: null,
      };
    case SEND_REPLY_FAILURE:
      return {
        ...state,
        sendReplyLoading: false,
        sendReplySuccess: false,
        sendReplyError: action.payload,
      };

    // ===== DOWNLOAD ATTACHMENT =====
    case DOWNLOAD_ATTACHMENT_REQUEST:
      return {
        ...state,
        downloadAttachmentLoading: true,
        downloadAttachmentError: null,
      };
    case DOWNLOAD_ATTACHMENT_SUCCESS:
      return {
        ...state,
        downloadAttachmentLoading: false,
        downloadAttachmentError: null,
      };
    case DOWNLOAD_ATTACHMENT_FAILURE:
      return {
        ...state,
        downloadAttachmentLoading: false,
        downloadAttachmentError: action.payload,
      };

    // ===== CLEAR MESSAGES =====
    case CLEAR_CONTACT_MESSAGES:
      return {
        ...state,
        createContactSuccess: false,
        createContactError: null,
        createContactMessage: null,
        sendReplySuccess: false,
        sendReplyError: null,
      };

    default:
      return state;
  }
};

export default contactReducer;
