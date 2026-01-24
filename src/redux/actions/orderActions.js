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

export const ORDER_CLEAR_MESSAGES = "ORDER_CLEAR_MESSAGES";

// ===== ACTION CREATORS =====

// Create order
export const orderCreateRequest = (
  selected_product_ids,
  receiverInfo,
  payment_method
) => ({
  type: ORDER_CREATE_REQUEST,
  payload: { selected_product_ids, receiverInfo, payment_method },
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

// Clear toast / error
export const clearOrderMessages = () => ({
  type: ORDER_CLEAR_MESSAGES,
});
