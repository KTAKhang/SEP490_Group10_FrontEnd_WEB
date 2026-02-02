// redux/actions/cartActions.js

// ===== ACTION TYPES =====
export const CART_FETCH_REQUEST = "CART_FETCH_REQUEST";
export const CART_FETCH_SUCCESS = "CART_FETCH_SUCCESS";
export const CART_FETCH_FAILURE = "CART_FETCH_FAILURE";

export const CART_ADD_ITEM_REQUEST = "CART_ADD_ITEM_REQUEST";
export const CART_ADD_ITEM_SUCCESS = "CART_ADD_ITEM_SUCCESS";
export const CART_ADD_ITEM_FAILURE = "CART_ADD_ITEM_FAILURE";

export const CART_UPDATE_ITEM_REQUEST = "CART_UPDATE_ITEM_REQUEST";
export const CART_UPDATE_ITEM_SUCCESS = "CART_UPDATE_ITEM_SUCCESS";
export const CART_UPDATE_ITEM_FAILURE = "CART_UPDATE_ITEM_FAILURE";

// ===== REMOVE ITEM (MULTI) =====
export const CART_REMOVE_ITEM_REQUEST = "CART_REMOVE_ITEM_REQUEST";
export const CART_REMOVE_ITEM_SUCCESS = "CART_REMOVE_ITEM_SUCCESS";
export const CART_REMOVE_ITEM_FAILURE = "CART_REMOVE_ITEM_FAILURE";

export const CLEAR_CART_MESSAGES = "CLEAR_CART_MESSAGES";

// ===== ACTION CREATORS =====

// Get cart
export const fetchCartRequest = () => ({
  type: CART_FETCH_REQUEST,
});

export const fetchCartSuccess = (data) => ({
  type: CART_FETCH_SUCCESS,
  payload: data,
});

export const fetchCartFailure = (error) => ({
  type: CART_FETCH_FAILURE,
  payload: error,
});

// Add item
export const addItemToCartRequest = (product_id, quantity) => ({
  type: CART_ADD_ITEM_REQUEST,
  payload: { product_id, quantity },
});

export const addItemToCartSuccess = (message) => ({
  type: CART_ADD_ITEM_SUCCESS,
  payload: message,
});

export const addItemToCartFailure = (error) => ({
  type: CART_ADD_ITEM_FAILURE,
  payload: error,
});

// Update item
export const updateCartItemRequest = (product_id, quantity) => ({
  type: CART_UPDATE_ITEM_REQUEST,
  payload: { product_id, quantity },
});

export const updateCartItemSuccess = (data) => ({
  type: CART_UPDATE_ITEM_SUCCESS,
  payload: data,
});

export const updateCartItemFailure = (error) => ({
  type: CART_UPDATE_ITEM_FAILURE,
  payload: error,
});

export const removeCartItemRequest = (product_ids) => ({
  type: CART_REMOVE_ITEM_REQUEST,
  payload: {
    product_ids: Array.isArray(product_ids)
      ? product_ids
      : [product_ids],
  },
});

export const removeCartItemSuccess = (data) => ({
  type: CART_REMOVE_ITEM_SUCCESS,
  payload: data,
});

export const removeCartItemFailure = (error) => ({
  type: CART_REMOVE_ITEM_FAILURE,
  payload: error,
});

// Clear messages
export const clearCartMessages = () => ({
  type: CLEAR_CART_MESSAGES,
});
