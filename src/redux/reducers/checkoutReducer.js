import {
  CHECKOUT_HOLD_REQUEST,
  CHECKOUT_HOLD_SUCCESS,
  CHECKOUT_HOLD_FAILURE,
  CHECKOUT_CANCEL_REQUEST,
  CHECKOUT_CANCEL_SUCCESS,
  CHECKOUT_CANCEL_FAILURE,
  CLEAR_CHECKOUT_MESSAGES,
} from "../actions/checkoutActions";

const initialState = {
  checkout_session_id: null,
  items: [],
  item_count: 0,

  loading: false,
  error: null,
  message: null,
};

const checkoutReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== HOLD =====
    case CHECKOUT_HOLD_REQUEST:
      return { ...state, loading: true, error: null };

    case CHECKOUT_HOLD_SUCCESS:
      return {
        ...state,
        loading: false,
        checkout_session_id: action.payload.checkout_session_id,
        items: action.payload.items,
        item_count: action.payload.item_count,
        message: action.payload.message,
      };

    case CHECKOUT_HOLD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== CANCEL =====
    case CHECKOUT_CANCEL_REQUEST:
      return { ...state, loading: true, error: null };

    case CHECKOUT_CANCEL_SUCCESS:
      return {
        ...initialState,
        message: action.payload,
      };

    case CHECKOUT_CANCEL_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== CLEAR =====
    case CLEAR_CHECKOUT_MESSAGES:
      return {
        ...state,
        error: null,
        message: null,
      };

    default:
      return state;
  }
};

export default checkoutReducer;
