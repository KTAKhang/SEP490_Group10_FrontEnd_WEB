/**
 * author: KhoanDCE170420
 * customerReducer.js
 * Reducer to handle customer-related actions
 */
import {
  CUSTOMER_LIST_REQUEST,
  CUSTOMER_LIST_SUCCESS,
  CUSTOMER_LIST_FAILURE,
  CUSTOMER_UPDATE_STATUS_REQUEST,
  CUSTOMER_UPDATE_STATUS_SUCCESS,
  CUSTOMER_UPDATE_STATUS_FAILURE,
  CUSTOMER_DETAIL_REQUEST,
  CUSTOMER_DETAIL_SUCCESS,
  CUSTOMER_DETAIL_FAILURE,
  CUSTOMER_ORDERS_REQUEST,
  CUSTOMER_ORDERS_SUCCESS,
  CUSTOMER_ORDERS_FAILURE,
} from "../actions/customerActions";

const initialState = {
  list: [],
  pagination: { page: 1, limit: 10, total: 0 },
  loading: false,
  error: null,
  detail: null,
  orders: [],
  ordersLoading: false,
  ordersError: null,
  params: { page: 1, limit: 10 }, 
};

export default function customerReducer(state = initialState, action) {
  switch (action.type) {
    case CUSTOMER_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        params: action.payload || state.params, 
      };
    case CUSTOMER_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload?.data || [],
        pagination: action.payload?.pagination || { page: 1, limit: 10, total: 0 },
      };
    case CUSTOMER_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CUSTOMER_UPDATE_STATUS_REQUEST:
    case CUSTOMER_DETAIL_REQUEST:
      return { ...state, loading: true, error: null };

    case CUSTOMER_UPDATE_STATUS_SUCCESS:
      return { ...state, loading: false };

    case CUSTOMER_UPDATE_STATUS_FAILURE:
    case CUSTOMER_DETAIL_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CUSTOMER_DETAIL_SUCCESS:
      return { ...state, loading: false, detail: action.payload };

    case CUSTOMER_ORDERS_REQUEST:
      return { ...state, ordersLoading: true, ordersError: null };

    case CUSTOMER_ORDERS_SUCCESS:
      return { 
        ...state, 
        ordersLoading: false, 
        orders: action.payload || [],
        ordersError: null,
      };

    case CUSTOMER_ORDERS_FAILURE:
      return { 
        ...state, 
        ordersLoading: false, 
        ordersError: action.payload,
        orders: [],
      };

    default:
      return state;
  }
}
