import {
  CONTACT_GET_CATEGORIES_REQUEST,
  CONTACT_GET_CATEGORIES_SUCCESS,
  CONTACT_GET_CATEGORIES_FAILURE,
  CONTACT_CREATE_CONTACT_REQUEST,
  CONTACT_CREATE_CONTACT_SUCCESS,
  CONTACT_CREATE_CONTACT_FAILURE,
  CONTACT_GET_MY_CONTACTS_REQUEST,
  CONTACT_GET_MY_CONTACTS_SUCCESS,
  CONTACT_GET_MY_CONTACTS_FAILURE,
  CONTACT_GET_CONTACT_DETAIL_REQUEST,
  CONTACT_GET_CONTACT_DETAIL_SUCCESS,
  CONTACT_GET_CONTACT_DETAIL_FAILURE,
  CONTACT_GET_CONTACT_REPLIES_REQUEST,
  CONTACT_GET_CONTACT_REPLIES_SUCCESS,
  CONTACT_GET_CONTACT_REPLIES_FAILURE,
  CONTACT_SEND_REPLY_REQUEST,
  CONTACT_SEND_REPLY_SUCCESS,
  CONTACT_SEND_REPLY_FAILURE,
  CONTACT_DOWNLOAD_ATTACHMENT_REQUEST,
  CONTACT_DOWNLOAD_ATTACHMENT_SUCCESS,
  CONTACT_DOWNLOAD_ATTACHMENT_FAILURE,
  CONTACT_CLEAR_MESSAGES,
  CONTACT_UPDATE_CONTACT_REQUEST,
  CONTACT_UPDATE_CONTACT_SUCCESS,
  CONTACT_UPDATE_CONTACT_FAILURE,
  CONTACT_UPDATE_REPLY_REQUEST,
  CONTACT_UPDATE_REPLY_SUCCESS,
  CONTACT_UPDATE_REPLY_FAILURE,
  CONTACT_DELETE_REPLY_REQUEST,
  CONTACT_DELETE_REPLY_SUCCESS,
  CONTACT_DELETE_REPLY_FAILURE,
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

  // Update Contact
  updateContactLoading: false,
  updateContactSuccess: false,
  updateContactError: null,

  // Update Reply
  updateReplyLoading: false,
  updateReplySuccess: false,
  updateReplyError: null,

  // Delete Reply
  deleteReplyLoading: false,
  deleteReplySuccess: false,
  deleteReplyError: null,
};

const contactReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== GET CATEGORIES =====
    case CONTACT_GET_CATEGORIES_REQUEST:
      return {
        ...state,
        categoriesLoading: true,
        categoriesError: null,
      };
    case CONTACT_GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload,
        categoriesLoading: false,
        categoriesError: null,
      };
    case CONTACT_GET_CATEGORIES_FAILURE:
      return {
        ...state,
        categoriesLoading: false,
        categoriesError: action.payload,
      };

    // ===== CREATE CONTACT =====
    case CONTACT_CREATE_CONTACT_REQUEST:
      return {
        ...state,
        createContactLoading: true,
        createContactSuccess: false,
        createContactError: null,
        createContactMessage: null,
      };
    case CONTACT_CREATE_CONTACT_SUCCESS:
      return {
        ...state,
        createContactLoading: false,
        createContactSuccess: true,
        createContactError: null,
        createContactMessage: action.payload.message || "Contact submitted successfully",
      };
    case CONTACT_CREATE_CONTACT_FAILURE:
      return {
        ...state,
        createContactLoading: false,
        createContactSuccess: false,
        createContactError: action.payload,
        createContactMessage: null,
      };

    // ===== GET MY CONTACTS =====
    case CONTACT_GET_MY_CONTACTS_REQUEST:
      return {
        ...state,
        contactsLoading: true,
        contactsError: null,
      };
    case CONTACT_GET_MY_CONTACTS_SUCCESS:
      return {
        ...state,
        contacts: action.payload,
        contactsLoading: false,
        contactsError: null,
      };
    case CONTACT_GET_MY_CONTACTS_FAILURE:
      return {
        ...state,
        contactsLoading: false,
        contactsError: action.payload,
      };

    // ===== GET CONTACT DETAIL =====
    case CONTACT_GET_CONTACT_DETAIL_REQUEST:
      return {
        ...state,
        contactDetailLoading: true,
        contactDetailError: null,
      };
    case CONTACT_GET_CONTACT_DETAIL_SUCCESS:
      return {
        ...state,
        contactDetail: action.payload,
        contactDetailLoading: false,
        contactDetailError: null,
      };
    case CONTACT_GET_CONTACT_DETAIL_FAILURE:
      return {
        ...state,
        contactDetailLoading: false,
        contactDetailError: action.payload,
      };

    // ===== GET CONTACT REPLIES =====
    case CONTACT_GET_CONTACT_REPLIES_REQUEST:
      return {
        ...state,
        repliesLoading: true,
        repliesError: null,
      };
    case CONTACT_GET_CONTACT_REPLIES_SUCCESS:
      return {
        ...state,
        replies: action.payload,
        repliesLoading: false,
        repliesError: null,
      };
    case CONTACT_GET_CONTACT_REPLIES_FAILURE:
      return {
        ...state,
        repliesLoading: false,
        repliesError: action.payload,
      };

    // ===== SEND REPLY =====
    case CONTACT_SEND_REPLY_REQUEST:
      return {
        ...state,
        sendReplyLoading: true,
        sendReplySuccess: false,
        sendReplyError: null,
      };
    case CONTACT_SEND_REPLY_SUCCESS:
      return {
        ...state,
        sendReplyLoading: false,
        sendReplySuccess: true,
        sendReplyError: null,
      };
    case CONTACT_SEND_REPLY_FAILURE:
      return {
        ...state,
        sendReplyLoading: false,
        sendReplySuccess: false,
        sendReplyError: action.payload,
      };

    // ===== DOWNLOAD ATTACHMENT =====
    case CONTACT_DOWNLOAD_ATTACHMENT_REQUEST:
      return {
        ...state,
        downloadAttachmentLoading: true,
        downloadAttachmentError: null,
      };
    case CONTACT_DOWNLOAD_ATTACHMENT_SUCCESS:
      return {
        ...state,
        downloadAttachmentLoading: false,
        downloadAttachmentError: null,
      };
    case CONTACT_DOWNLOAD_ATTACHMENT_FAILURE:
      return {
        ...state,
        downloadAttachmentLoading: false,
        downloadAttachmentError: action.payload,
      };

    // ===== UPDATE CONTACT =====
    case CONTACT_UPDATE_CONTACT_REQUEST:
      return {
        ...state,
        updateContactLoading: true,
        updateContactSuccess: false,
        updateContactError: null,
      };
    case CONTACT_UPDATE_CONTACT_SUCCESS:
      return {
        ...state,
        updateContactLoading: false,
        updateContactSuccess: true,
        updateContactError: null,
      };
    case CONTACT_UPDATE_CONTACT_FAILURE:
      return {
        ...state,
        updateContactLoading: false,
        updateContactSuccess: false,
        updateContactError: action.payload,
      };

    // ===== UPDATE REPLY =====
    case CONTACT_UPDATE_REPLY_REQUEST:
      return {
        ...state,
        updateReplyLoading: true,
        updateReplySuccess: false,
        updateReplyError: null,
      };
    case CONTACT_UPDATE_REPLY_SUCCESS:
      return {
        ...state,
        updateReplyLoading: false,
        updateReplySuccess: true,
        updateReplyError: null,
      };
    case CONTACT_UPDATE_REPLY_FAILURE:
      return {
        ...state,
        updateReplyLoading: false,
        updateReplySuccess: false,
        updateReplyError: action.payload,
      };

    // ===== DELETE REPLY =====
    case CONTACT_DELETE_REPLY_REQUEST:
      return {
        ...state,
        deleteReplyLoading: true,
        deleteReplySuccess: false,
        deleteReplyError: null,
      };
    case CONTACT_DELETE_REPLY_SUCCESS:
      return {
        ...state,
        deleteReplyLoading: false,
        deleteReplySuccess: true,
        deleteReplyError: null,
      };
    case CONTACT_DELETE_REPLY_FAILURE:
      return {
        ...state,
        deleteReplyLoading: false,
        deleteReplySuccess: false,
        deleteReplyError: action.payload,
      };

    // ===== CLEAR MESSAGES =====
    case CONTACT_CLEAR_MESSAGES:
      return {
        ...state,
        createContactSuccess: false,
        createContactError: null,
        createContactMessage: null,
        sendReplySuccess: false,
        sendReplyError: null,
        updateContactSuccess: false,
        updateContactError: null,
      };

    default:
      return state;
  }
};

export default contactReducer;
