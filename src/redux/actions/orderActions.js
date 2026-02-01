// ===== ACTION TYPES =====
export const ORDER_CREATE_REQUEST = "ORDER_CREATE_REQUEST";
export const ORDER_CREATE_SUCCESS = "ORDER_CREATE_SUCCESS";
export const ORDER_CREATE_FAILURE = "ORDER_CREATE_FAILURE";

export const RETRY_PAYMENT_REQUEST = "RETRY_PAYMENT_REQUEST";
export const RETRY_PAYMENT_SUCCESS = "RETRY_PAYMENT_SUCCESS";
export const RETRY_PAYMENT_FAILURE = "RETRY_PAYMENT_FAILURE";

export const ORDER_CANCEL_REQUEST = "ORDER_CANCEL_REQUEST";
export const ORDER_CANCEL_SUCCESS = "ORDER_CANCEL_SUCCESS";
export const ORDER_CANCEL_FAILURE = "ORDER_CANCEL_FAILURE";

export const ORDER_HISTORY_REQUEST = "ORDER_HISTORY_REQUEST";
export const ORDER_HISTORY_SUCCESS = "ORDER_HISTORY_SUCCESS";
export const ORDER_HISTORY_FAILURE = "ORDER_HISTORY_FAILURE";

export const ORDER_DETAIL_REQUEST = "ORDER_DETAIL_REQUEST";
export const ORDER_DETAIL_SUCCESS = "ORDER_DETAIL_SUCCESS";
export const ORDER_DETAIL_FAILURE = "ORDER_DETAIL_FAILURE";

export const ORDER_ADMIN_LIST_REQUEST = "ORDER_ADMIN_LIST_REQUEST";
export const ORDER_ADMIN_LIST_SUCCESS = "ORDER_ADMIN_LIST_SUCCESS";
export const ORDER_ADMIN_LIST_FAILURE = "ORDER_ADMIN_LIST_FAILURE";

export const ORDER_ADMIN_UPDATE_REQUEST = "ORDER_ADMIN_UPDATE_REQUEST";
export const ORDER_ADMIN_UPDATE_SUCCESS = "ORDER_ADMIN_UPDATE_SUCCESS";
export const ORDER_ADMIN_UPDATE_FAILURE = "ORDER_ADMIN_UPDATE_FAILURE";

export const ORDER_ADMIN_DETAIL_REQUEST = "ORDER_ADMIN_DETAIL_REQUEST";
export const ORDER_ADMIN_DETAIL_SUCCESS = "ORDER_ADMIN_DETAIL_SUCCESS";
export const ORDER_ADMIN_DETAIL_FAILURE = "ORDER_ADMIN_DETAIL_FAILURE";

export const ORDER_ADMIN_STATS_REQUEST = "ORDER_ADMIN_STATS_REQUEST";
export const ORDER_ADMIN_STATS_SUCCESS = "ORDER_ADMIN_STATS_SUCCESS";
export const ORDER_ADMIN_STATS_FAILURE = "ORDER_ADMIN_STATS_FAILURE";

export const ORDER_CLEAR_MESSAGES = "ORDER_CLEAR_MESSAGES";

// ===== ACTION CREATORS =====

// Create order (discountInfo dùng cho VNPAY: áp discount trước khi redirect, giống flow COD)
export const orderCreateRequest = (
  selected_product_ids,
  receiverInfo,
  payment_method,
  discountInfo = null
) => ({
  type: ORDER_CREATE_REQUEST,
  payload: { selected_product_ids, receiverInfo, payment_method, discountInfo },
});

export const orderCreateSuccess = (data) => ({
  type: ORDER_CREATE_SUCCESS,
  payload: data,
});

export const orderCreateFailure = (error) => ({
  type: ORDER_CREATE_FAILURE,
  payload: error,
});

export const retryPaymentRequest = (order_id) => ({
  type: RETRY_PAYMENT_REQUEST,
  payload: { order_id },
});

export const retryPaymentSuccess = (data) => ({
  type: RETRY_PAYMENT_SUCCESS,
  payload: data,
});

export const retryPaymentFailure = (error) => ({
  type: RETRY_PAYMENT_FAILURE,
  payload: error,
});

// Cancel order (customer)
export const orderCancelRequest = (order_id) => ({
  type: ORDER_CANCEL_REQUEST,
  payload: { order_id },
});

export const orderCancelSuccess = (message) => ({
  type: ORDER_CANCEL_SUCCESS,
  payload: message,
});

export const orderCancelFailure = (error) => ({
  type: ORDER_CANCEL_FAILURE,
  payload: error,
});

// Order history (customer)
export const orderHistoryRequest = (params = {}) => ({
  type: ORDER_HISTORY_REQUEST,
  payload: params,
});

export const orderHistorySuccess = (data) => ({
  type: ORDER_HISTORY_SUCCESS,
  payload: data,
});

export const orderHistoryFailure = (error) => ({
  type: ORDER_HISTORY_FAILURE,
  payload: error,
});

// Order detail (customer)
export const orderDetailRequest = (order_id) => ({
  type: ORDER_DETAIL_REQUEST,
  payload: { order_id },
});

export const orderDetailSuccess = (data) => ({
  type: ORDER_DETAIL_SUCCESS,
  payload: data,
});

export const orderDetailFailure = (error) => ({
  type: ORDER_DETAIL_FAILURE,
  payload: error,
});

// Admin list orders
export const orderAdminListRequest = (params = {}) => ({
  type: ORDER_ADMIN_LIST_REQUEST,
  payload: params,
});

export const orderAdminListSuccess = (data) => ({
  type: ORDER_ADMIN_LIST_SUCCESS,
  payload: data,
});

export const orderAdminListFailure = (error) => ({
  type: ORDER_ADMIN_LIST_FAILURE,
  payload: error,
});

// Admin update order status
export const orderAdminUpdateRequest = (order_id, status_name, note) => ({
  type: ORDER_ADMIN_UPDATE_REQUEST,
  payload: { order_id, status_name, note },
});

export const orderAdminUpdateSuccess = (message) => ({
  type: ORDER_ADMIN_UPDATE_SUCCESS,
  payload: message,
});

export const orderAdminUpdateFailure = (error) => ({
  type: ORDER_ADMIN_UPDATE_FAILURE,
  payload: error,
});

// Admin order detail
export const orderAdminDetailRequest = (order_id) => ({
  type: ORDER_ADMIN_DETAIL_REQUEST,
  payload: { order_id },
});

export const orderAdminDetailSuccess = (data) => ({
  type: ORDER_ADMIN_DETAIL_SUCCESS,
  payload: data,
});

export const orderAdminDetailFailure = (error) => ({
  type: ORDER_ADMIN_DETAIL_FAILURE,
  payload: error,
});

// Admin order stats
export const orderAdminStatsRequest = () => ({
  type: ORDER_ADMIN_STATS_REQUEST,
});

export const orderAdminStatsSuccess = (data) => ({
  type: ORDER_ADMIN_STATS_SUCCESS,
  payload: data,
});

export const orderAdminStatsFailure = (error) => ({
  type: ORDER_ADMIN_STATS_FAILURE,
  payload: error,
});

// Clear toast / error
export const clearOrderMessages = () => ({
  type: ORDER_CLEAR_MESSAGES,
});
