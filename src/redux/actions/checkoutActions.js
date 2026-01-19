// ===== ACTION TYPES =====
export const CHECKOUT_HOLD_REQUEST = "CHECKOUT_HOLD_REQUEST";
export const CHECKOUT_HOLD_SUCCESS = "CHECKOUT_HOLD_SUCCESS";
export const CHECKOUT_HOLD_FAILURE = "CHECKOUT_HOLD_FAILURE";

export const CHECKOUT_CANCEL_REQUEST = "CHECKOUT_CANCEL_REQUEST";
export const CHECKOUT_CANCEL_SUCCESS = "CHECKOUT_CANCEL_SUCCESS";
export const CHECKOUT_CANCEL_FAILURE = "CHECKOUT_CANCEL_FAILURE";

export const CLEAR_CHECKOUT_MESSAGES = "CLEAR_CHECKOUT_MESSAGES";

// ===== ACTION CREATORS =====

// Hold checkout
export const checkoutHoldRequest = (
  selected_product_ids,
  checkout_session_id
) => ({
  type: CHECKOUT_HOLD_REQUEST,
  payload: { selected_product_ids, checkout_session_id },
});

export const checkoutHoldSuccess = (data) => ({
  type: CHECKOUT_HOLD_SUCCESS,
  payload: data,
});

export const checkoutHoldFailure = (error) => ({
  type: CHECKOUT_HOLD_FAILURE,
  payload: error,
});

// Cancel checkout
export const checkoutCancelRequest = (checkout_session_id) => ({
  type: CHECKOUT_CANCEL_REQUEST,
  payload: { checkout_session_id },
});

export const checkoutCancelSuccess = (message) => ({
  type: CHECKOUT_CANCEL_SUCCESS,
  payload: message,
});

export const checkoutCancelFailure = (error) => ({
  type: CHECKOUT_CANCEL_FAILURE,
  payload: error,
});

// Clear messages
export const clearCheckoutMessages = () => ({
  type: CLEAR_CHECKOUT_MESSAGES,
});
