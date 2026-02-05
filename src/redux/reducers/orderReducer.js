import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAILURE,
  RETRY_PAYMENT_REQUEST,
  RETRY_PAYMENT_SUCCESS,
  RETRY_PAYMENT_FAILURE,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CANCEL_FAILURE,
  ORDER_HISTORY_REQUEST,
  ORDER_HISTORY_SUCCESS,
  ORDER_HISTORY_FAILURE,
  ORDER_DETAIL_REQUEST,
  ORDER_DETAIL_SUCCESS,
  ORDER_DETAIL_FAILURE,
  ORDER_ADMIN_LIST_REQUEST,
  ORDER_ADMIN_LIST_SUCCESS,
  ORDER_ADMIN_LIST_FAILURE,
  ORDER_ADMIN_UPDATE_REQUEST,
  ORDER_ADMIN_UPDATE_SUCCESS,
  ORDER_ADMIN_UPDATE_FAILURE,
  ORDER_ADMIN_DETAIL_REQUEST,
  ORDER_ADMIN_DETAIL_SUCCESS,
  ORDER_ADMIN_DETAIL_FAILURE,
  ORDER_ADMIN_STATS_REQUEST,
  ORDER_ADMIN_STATS_SUCCESS,
  ORDER_ADMIN_STATS_FAILURE,
  ORDER_STATUS_LOGS_REQUEST,
  ORDER_STATUS_LOGS_SUCCESS,
  ORDER_STATUS_LOGS_FAILURE,
  ORDER_CLEAR_MESSAGES,
} from "../actions/orderActions";

const initialState = {
  order_id: null,
  payment_url: null, // dùng cho VNPAY

  orders: [],
  ordersPagination: null,
  orderDetail: null,

  adminOrders: [],
  adminPagination: null,
  adminDetail: null,
  adminStats: null,

  orderStatusLogs: null,
  orderStatusLogsPagination: null,
  orderStatusLogsLoading: false,
  orderStatusLogsError: null,

  loading: false,
  historyLoading: false,
  detailLoading: false,
  adminLoading: false,
  adminUpdateLoading: false,
  adminDetailLoading: false,
  adminStatsLoading: false,
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

     case RETRY_PAYMENT_REQUEST:
      return { ...state, loading: true, error: null };

    case RETRY_PAYMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        order_id: action.payload.order_id || null,
        payment_url: action.payload.payment_url || null,
        message: "Thanh toán thành công",
      };

    case RETRY_PAYMENT_FAILURE:
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

    // ===== ORDER HISTORY =====
    case ORDER_HISTORY_REQUEST:
      return { ...state, historyLoading: true, error: null };

    case ORDER_HISTORY_SUCCESS:
      return {
        ...state,
        historyLoading: false,
        orders: action.payload.data || [],
        ordersPagination: action.payload.pagination || null,
      };

    case ORDER_HISTORY_FAILURE:
      return { ...state, historyLoading: false, error: action.payload };

    // ===== ORDER DETAIL =====
    case ORDER_DETAIL_REQUEST:
      return { ...state, detailLoading: true, error: null };

    case ORDER_DETAIL_SUCCESS:
      return {
        ...state,
        detailLoading: false,
        orderDetail: action.payload,
      };

    case ORDER_DETAIL_FAILURE:
      return { ...state, detailLoading: false, error: action.payload };

    // ===== ADMIN LIST =====
    case ORDER_ADMIN_LIST_REQUEST:
      return { ...state, adminLoading: true, error: null };

    case ORDER_ADMIN_LIST_SUCCESS:
      return {
        ...state,
        adminLoading: false,
        adminOrders: action.payload.data || [],
        adminPagination: action.payload.pagination || null,
      };

    case ORDER_ADMIN_LIST_FAILURE:
      return { ...state, adminLoading: false, error: action.payload };

    // ===== ADMIN UPDATE =====
    case ORDER_ADMIN_UPDATE_REQUEST:
      return { ...state, adminUpdateLoading: true, error: null };

    case ORDER_ADMIN_UPDATE_SUCCESS:
      return {
        ...state,
        adminUpdateLoading: false,
        message: action.payload,
      };

    case ORDER_ADMIN_UPDATE_FAILURE:
      return { ...state, adminUpdateLoading: false, error: action.payload };

    // ===== ADMIN DETAIL =====
    case ORDER_ADMIN_DETAIL_REQUEST:
      return { ...state, adminDetailLoading: true, error: null };

    case ORDER_ADMIN_DETAIL_SUCCESS:
      return {
        ...state,
        adminDetailLoading: false,
        adminDetail: action.payload,
      };

    case ORDER_ADMIN_DETAIL_FAILURE:
      return { ...state, adminDetailLoading: false, error: action.payload };

    // ===== ADMIN STATS =====
    case ORDER_ADMIN_STATS_REQUEST:
      return { ...state, adminStatsLoading: true, error: null };

    case ORDER_ADMIN_STATS_SUCCESS:
      return {
        ...state,
        adminStatsLoading: false,
        adminStats: action.payload,
      };

    case ORDER_ADMIN_STATS_FAILURE:
      return { ...state, adminStatsLoading: false, error: action.payload };

    // ===== ORDER STATUS LOGS (admin: who updated order) =====
    case ORDER_STATUS_LOGS_REQUEST:
      return {
        ...state,
        orderStatusLogsLoading: true,
        orderStatusLogsError: null,
        orderStatusLogs: null,
      };

    case ORDER_STATUS_LOGS_SUCCESS:
      return {
        ...state,
        orderStatusLogsLoading: false,
        orderStatusLogs: action.payload?.data ?? action.payload,
        orderStatusLogsPagination: action.payload?.pagination ?? null,
        orderStatusLogsError: null,
      };

    case ORDER_STATUS_LOGS_FAILURE:
      return {
        ...state,
        orderStatusLogsLoading: false,
        orderStatusLogs: null,
        orderStatusLogsError: action.payload,
      };

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
