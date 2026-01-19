// ===== PRODUCT BATCH ACTIONS =====
export const GET_PRODUCT_BATCH_HISTORY_REQUEST = "GET_PRODUCT_BATCH_HISTORY_REQUEST";
export const GET_PRODUCT_BATCH_HISTORY_SUCCESS = "GET_PRODUCT_BATCH_HISTORY_SUCCESS";
export const GET_PRODUCT_BATCH_HISTORY_FAILURE = "GET_PRODUCT_BATCH_HISTORY_FAILURE";

export const RESET_PRODUCT_BATCH_REQUEST = "RESET_PRODUCT_BATCH_REQUEST";
export const RESET_PRODUCT_BATCH_SUCCESS = "RESET_PRODUCT_BATCH_SUCCESS";
export const RESET_PRODUCT_BATCH_FAILURE = "RESET_PRODUCT_BATCH_FAILURE";

export const GET_PENDING_RESET_PRODUCTS_REQUEST = "GET_PENDING_RESET_PRODUCTS_REQUEST";
export const GET_PENDING_RESET_PRODUCTS_SUCCESS = "GET_PENDING_RESET_PRODUCTS_SUCCESS";
export const GET_PENDING_RESET_PRODUCTS_FAILURE = "GET_PENDING_RESET_PRODUCTS_FAILURE";

export const CONFIRM_RESET_PRODUCT_REQUEST = "CONFIRM_RESET_PRODUCT_REQUEST";
export const CONFIRM_RESET_PRODUCT_SUCCESS = "CONFIRM_RESET_PRODUCT_SUCCESS";
export const CONFIRM_RESET_PRODUCT_FAILURE = "CONFIRM_RESET_PRODUCT_FAILURE";

// ===== PRODUCT BATCH ACTION CREATORS =====
export const getProductBatchHistoryRequest = (productId, params = {}) => ({
  type: GET_PRODUCT_BATCH_HISTORY_REQUEST,
  payload: { productId, params },
});

export const getProductBatchHistorySuccess = (data) => ({
  type: GET_PRODUCT_BATCH_HISTORY_SUCCESS,
  payload: data,
});

export const getProductBatchHistoryFailure = (error) => ({
  type: GET_PRODUCT_BATCH_HISTORY_FAILURE,
  payload: error,
});

export const resetProductBatchRequest = (productId, completionReason = "SOLD_OUT") => ({
  type: RESET_PRODUCT_BATCH_REQUEST,
  payload: { productId, completionReason },
});

export const resetProductBatchSuccess = (data) => ({
  type: RESET_PRODUCT_BATCH_SUCCESS,
  payload: data,
});

export const resetProductBatchFailure = (error) => ({
  type: RESET_PRODUCT_BATCH_FAILURE,
  payload: error,
});

export const getPendingResetProductsRequest = (params = {}) => ({
  type: GET_PENDING_RESET_PRODUCTS_REQUEST,
  payload: params,
});

export const getPendingResetProductsSuccess = (data) => ({
  type: GET_PENDING_RESET_PRODUCTS_SUCCESS,
  payload: data,
});

export const getPendingResetProductsFailure = (error) => ({
  type: GET_PENDING_RESET_PRODUCTS_FAILURE,
  payload: error,
});

export const confirmResetProductRequest = (productId) => ({
  type: CONFIRM_RESET_PRODUCT_REQUEST,
  payload: productId,
});

export const confirmResetProductSuccess = (data) => ({
  type: CONFIRM_RESET_PRODUCT_SUCCESS,
  payload: data,
});

export const confirmResetProductFailure = (error) => ({
  type: CONFIRM_RESET_PRODUCT_FAILURE,
  payload: error,
});
