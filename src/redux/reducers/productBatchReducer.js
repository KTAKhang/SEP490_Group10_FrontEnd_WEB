import {
  GET_PRODUCT_BATCH_HISTORY_REQUEST,
  GET_PRODUCT_BATCH_HISTORY_SUCCESS,
  GET_PRODUCT_BATCH_HISTORY_FAILURE,
  RESET_PRODUCT_BATCH_REQUEST,
  RESET_PRODUCT_BATCH_SUCCESS,
  RESET_PRODUCT_BATCH_FAILURE,
  GET_PENDING_RESET_PRODUCTS_REQUEST,
  GET_PENDING_RESET_PRODUCTS_SUCCESS,
  GET_PENDING_RESET_PRODUCTS_FAILURE,
  CONFIRM_RESET_PRODUCT_REQUEST,
  CONFIRM_RESET_PRODUCT_SUCCESS,
  CONFIRM_RESET_PRODUCT_FAILURE,
} from "../actions/productBatchActions";

const initialState = {
  batchHistory: [],
  batchHistoryPagination: null,
  batchHistoryLoading: false,
  batchHistoryError: null,
  resetBatchLoading: false,
  resetBatchError: null,
  pendingResetProducts: [],
  pendingResetPagination: null,
  pendingResetLoading: false,
  pendingResetError: null,
  confirmResetLoading: false,
  confirmResetError: null,
};

const productBatchReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PRODUCT_BATCH_HISTORY_REQUEST:
      return {
        ...state,
        batchHistoryLoading: true,
        batchHistoryError: null,
      };

    case GET_PRODUCT_BATCH_HISTORY_SUCCESS:
      return {
        ...state,
        batchHistoryLoading: false,
        batchHistory: action.payload.data || [],
        batchHistoryPagination: action.payload.pagination || null,
        batchHistoryError: null,
      };

    case GET_PRODUCT_BATCH_HISTORY_FAILURE:
      return {
        ...state,
        batchHistoryLoading: false,
        batchHistoryError: action.payload,
      };

    case RESET_PRODUCT_BATCH_REQUEST:
      return {
        ...state,
        resetBatchLoading: true,
        resetBatchError: null,
      };

    case RESET_PRODUCT_BATCH_SUCCESS:
      return {
        ...state,
        resetBatchLoading: false,
        resetBatchError: null,
      };

    case RESET_PRODUCT_BATCH_FAILURE:
      return {
        ...state,
        resetBatchLoading: false,
        resetBatchError: action.payload,
      };

    case GET_PENDING_RESET_PRODUCTS_REQUEST:
      return {
        ...state,
        pendingResetLoading: true,
        pendingResetError: null,
      };

    case GET_PENDING_RESET_PRODUCTS_SUCCESS:
      return {
        ...state,
        pendingResetLoading: false,
        pendingResetProducts: action.payload.data || [],
        pendingResetPagination: action.payload.pagination || null,
        pendingResetError: null,
      };

    case GET_PENDING_RESET_PRODUCTS_FAILURE:
      return {
        ...state,
        pendingResetLoading: false,
        pendingResetError: action.payload,
      };

    case CONFIRM_RESET_PRODUCT_REQUEST:
      return {
        ...state,
        confirmResetLoading: true,
        confirmResetError: null,
      };

    case CONFIRM_RESET_PRODUCT_SUCCESS:
      return {
        ...state,
        confirmResetLoading: false,
        confirmResetError: null,
      };

    case CONFIRM_RESET_PRODUCT_FAILURE:
      return {
        ...state,
        confirmResetLoading: false,
        confirmResetError: action.payload,
      };

    default:
      return state;
  }
};

export default productBatchReducer;
