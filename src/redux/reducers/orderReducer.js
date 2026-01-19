import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAILURE,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CANCEL_FAILURE,
  ORDER_CLEAR_MESSAGES,
} from "../actions/orderActions";

const initialState = {
  order_id: null,
  payment_url: null, // dùng cho VNPAY

  loading: false,
  error: null,
  message: null,
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== CREATE =====
    case ORDER_CREATE_REQUEST:
      return { ...state, loading: true, error: null };

    case ORDER_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        order_id: action.payload.order_id || null,
        payment_url: action.payload.payment_url || null,
        message: "Tạo đơn hàng thành công",
      };

    case ORDER_CREATE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== CANCEL =====
    case ORDER_CANCEL_REQUEST:
      return { ...state, loading: true, error: null };

    case ORDER_CANCEL_SUCCESS:
      return {
        ...state,
        loading: false,
        message: action.payload,
      };

    case ORDER_CANCEL_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== CLEAR =====
    case ORDER_CLEAR_MESSAGES:
      return {
        ...state,
        error: null,
        message: null,
      };

    default:
      return state;
  }
};

export default orderReducer;
