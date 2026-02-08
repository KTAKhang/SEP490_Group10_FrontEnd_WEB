// redux/reducers/cartReducer.js
import {
  CART_FETCH_REQUEST,
  CART_FETCH_SUCCESS,
  CART_FETCH_FAILURE,
  CART_ADD_ITEM_REQUEST,
  CART_ADD_ITEM_SUCCESS,
  CART_ADD_ITEM_FAILURE,
  CART_UPDATE_ITEM_REQUEST,
  CART_UPDATE_ITEM_SUCCESS,
  CART_UPDATE_ITEM_FAILURE,
  CART_REMOVE_ITEM_REQUEST,
  CART_REMOVE_ITEM_SUCCESS,
  CART_REMOVE_ITEM_FAILURE,
  CLEAR_CART_MESSAGES,
} from "../actions/cartActions";

const initialState = {
  cart_id: null,
  items: [],
  sum: 0,
  item_count: 0,

  // Shipping info
  shippingType: null,
  shippingFee: 0,
  totalWeight: 0,
  updateLoading: false,
  loading: false,
  error: null,
  message: null,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== FETCH CART =====
    case CART_FETCH_REQUEST:
      return { ...state, loading: true, error: null };

    case CART_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        cart_id: action.payload.cart_id,
        items: action.payload.items,
        sum: action.payload.sum,
        item_count: action.payload.item_count,
      };

    case CART_FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== ADD ITEM =====
    case CART_ADD_ITEM_REQUEST:
      return { ...state, loading: true, error: null };

    case CART_ADD_ITEM_SUCCESS:
      return { ...state, loading: false, message: action.payload };

    case CART_ADD_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== UPDATE ITEM =====
    case CART_UPDATE_ITEM_REQUEST:
      return { ...state, updateLoading: true, error: null };

    case CART_UPDATE_ITEM_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        sum: action.payload.total_items,
        item_count: action.payload.total_items,
      };

    case CART_UPDATE_ITEM_FAILURE:
      return { ...state, updateLoading: false, error: action.payload };

    // ===== REMOVE ITEM =====
    case CART_REMOVE_ITEM_REQUEST:
      return { ...state, loading: true, error: null };

    case CART_REMOVE_ITEM_SUCCESS:
      return {
        ...state,
        loading: false,
        sum: action.payload.sum, // ✅ tổng quantity còn lại
      };

    case CART_REMOVE_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== SHIPPING CHECK =====
    case "SHIPPING_CHECK_REQUEST":
      return { ...state, loading: true, error: null };

    case "SHIPPING_CHECK_SUCCESS":
      return {
        ...state,
        loading: false,
        shippingType: action.payload.shippingType,
        totalWeight: action.payload.totalWeight,
        shippingFee: action.payload.shippingFee,
      };

    case "SHIPPING_CHECK_FAILURE":
      return { ...state, loading: false, error: action.payload };

    // ===== CLEAR =====
    case CLEAR_CART_MESSAGES:
      return {
        ...state,
        error: null,
        message: null,
      };

    default:
      return state;
  }
};

export default cartReducer;
