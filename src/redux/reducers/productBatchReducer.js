import {
  GET_PRODUCT_BATCH_HISTORY_REQUEST,
  GET_PRODUCT_BATCH_HISTORY_SUCCESS,
  GET_PRODUCT_BATCH_HISTORY_FAILURE,
  RESET_PRODUCT_BATCH_REQUEST,
  RESET_PRODUCT_BATCH_SUCCESS,
  RESET_PRODUCT_BATCH_FAILURE,
} from "../actions/productBatchActions";

const initialState = {
  batchHistory: [],
  batchHistoryPagination: null,
  batchHistoryLoading: false,
  batchHistoryError: null,
  resetBatchLoading: false,
  resetBatchError: null,
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

    default:
      return state;
  }
};

export default productBatchReducer;
