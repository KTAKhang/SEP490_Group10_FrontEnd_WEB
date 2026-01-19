// ===== INVENTORY TRANSACTION ACTIONS =====
export const CREATE_RECEIPT_REQUEST = "CREATE_RECEIPT_REQUEST";
export const CREATE_RECEIPT_SUCCESS = "CREATE_RECEIPT_SUCCESS";
export const CREATE_RECEIPT_FAILURE = "CREATE_RECEIPT_FAILURE";

export const GET_RECEIPT_HISTORY_REQUEST = "GET_RECEIPT_HISTORY_REQUEST";
export const GET_RECEIPT_HISTORY_SUCCESS = "GET_RECEIPT_HISTORY_SUCCESS";
export const GET_RECEIPT_HISTORY_FAILURE = "GET_RECEIPT_HISTORY_FAILURE";

export const GET_RECEIPT_BY_ID_REQUEST = "GET_RECEIPT_BY_ID_REQUEST";
export const GET_RECEIPT_BY_ID_SUCCESS = "GET_RECEIPT_BY_ID_SUCCESS";
export const GET_RECEIPT_BY_ID_FAILURE = "GET_RECEIPT_BY_ID_FAILURE";

// ===== CLEAR MESSAGES =====
export const CLEAR_INVENTORY_MESSAGES = "CLEAR_INVENTORY_MESSAGES";

// ===== INVENTORY TRANSACTION ACTION CREATORS =====
export const createReceiptRequest = (formData) => ({
  type: CREATE_RECEIPT_REQUEST,
  payload: formData,
});

export const createReceiptSuccess = (data) => ({
  type: CREATE_RECEIPT_SUCCESS,
  payload: data,
});

export const createReceiptFailure = (error) => ({
  type: CREATE_RECEIPT_FAILURE,
  payload: error,
});

export const getReceiptHistoryRequest = (params = {}) => ({
  type: GET_RECEIPT_HISTORY_REQUEST,
  payload: params,
});

export const getReceiptHistorySuccess = (data) => ({
  type: GET_RECEIPT_HISTORY_SUCCESS,
  payload: data,
});

export const getReceiptHistoryFailure = (error) => ({
  type: GET_RECEIPT_HISTORY_FAILURE,
  payload: error,
});

export const getReceiptByIdRequest = (receiptId) => ({
  type: GET_RECEIPT_BY_ID_REQUEST,
  payload: receiptId,
});

export const getReceiptByIdSuccess = (data) => ({
  type: GET_RECEIPT_BY_ID_SUCCESS,
  payload: data,
});

export const getReceiptByIdFailure = (error) => ({
  type: GET_RECEIPT_BY_ID_FAILURE,
  payload: error,
});

// ===== CLEAR MESSAGES =====
export const clearInventoryMessages = () => ({
  type: CLEAR_INVENTORY_MESSAGES,
});
