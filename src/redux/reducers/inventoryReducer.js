import {
  CREATE_RECEIPT_REQUEST,
  CREATE_RECEIPT_SUCCESS,
  CREATE_RECEIPT_FAILURE,
  GET_RECEIPT_HISTORY_REQUEST,
  GET_RECEIPT_HISTORY_SUCCESS,
  GET_RECEIPT_HISTORY_FAILURE,
  GET_RECEIPT_BY_ID_REQUEST,
  GET_RECEIPT_BY_ID_SUCCESS,
  GET_RECEIPT_BY_ID_FAILURE,
  CLEAR_INVENTORY_MESSAGES,
} from "../actions/inventoryActions";

const initialState = {
  createReceiptLoading: false,
  createReceiptError: null,
  receiptHistory: [],
  receiptHistoryPagination: null,
  receiptHistoryLoading: false,
  receiptHistoryError: null,
  receiptDetail: null,
  receiptDetailLoading: false,
  receiptDetailError: null,
};

const inventoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== CREATE RECEIPT =====
    case CREATE_RECEIPT_REQUEST:
      return {
        ...state,
        createReceiptLoading: true,
        createReceiptError: null,
      };
    case CREATE_RECEIPT_SUCCESS:
      return {
        ...state,
        createReceiptLoading: false,
        createReceiptError: null,
      };
    case CREATE_RECEIPT_FAILURE:
      return {
        ...state,
        createReceiptLoading: false,
        createReceiptError: action.payload,
      };

    // ===== GET RECEIPT HISTORY =====
    case GET_RECEIPT_HISTORY_REQUEST:
      return {
        ...state,
        receiptHistoryLoading: true,
        receiptHistoryError: null,
      };
    case GET_RECEIPT_HISTORY_SUCCESS:
      return {
        ...state,
        receiptHistoryLoading: false,
        receiptHistory: action.payload.data || [],
        receiptHistoryPagination: action.payload.pagination || null,
        receiptHistoryError: null,
      };
    case GET_RECEIPT_HISTORY_FAILURE:
      return {
        ...state,
        receiptHistoryLoading: false,
        receiptHistoryError: action.payload,
      };

    // ===== GET RECEIPT BY ID =====
    case GET_RECEIPT_BY_ID_REQUEST:
      return {
        ...state,
        receiptDetailLoading: true,
        receiptDetailError: null,
        receiptDetail: null,
      };
    case GET_RECEIPT_BY_ID_SUCCESS:
      return {
        ...state,
        receiptDetailLoading: false,
        receiptDetail: action.payload,
        receiptDetailError: null,
      };
    case GET_RECEIPT_BY_ID_FAILURE:
      return {
        ...state,
        receiptDetailLoading: false,
        receiptDetailError: action.payload,
        receiptDetail: null,
      };

    // ===== CLEAR MESSAGES =====
    case CLEAR_INVENTORY_MESSAGES:
      return {
        ...state,
        createReceiptError: null,
      };

    default:
      return state;
  }
};

export default inventoryReducer;
