import {
  GET_ADMIN_REVIEWS_REQUEST,
  GET_ADMIN_REVIEWS_SUCCESS,
  GET_ADMIN_REVIEWS_FAILURE,
  UPDATE_REVIEW_VISIBILITY_REQUEST,
  UPDATE_REVIEW_VISIBILITY_SUCCESS,
  UPDATE_REVIEW_VISIBILITY_FAILURE,
  GET_PRODUCT_REVIEWS_REQUEST,
  GET_PRODUCT_REVIEWS_SUCCESS,
  GET_PRODUCT_REVIEWS_FAILURE,
  GET_PRODUCT_REVIEW_STATS_REQUEST,
  GET_PRODUCT_REVIEW_STATS_SUCCESS,
  GET_PRODUCT_REVIEW_STATS_FAILURE,
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  CREATE_REVIEW_FAILURE,
  UPDATE_REVIEW_REQUEST,
  UPDATE_REVIEW_SUCCESS,
  UPDATE_REVIEW_FAILURE,
  DELETE_REVIEW_REQUEST,
  DELETE_REVIEW_SUCCESS,
  DELETE_REVIEW_FAILURE,
  CLEAR_REVIEW_MESSAGES,
} from "../actions/reviewActions";

const initialState = {
  adminReviews: [],
  adminPagination: null,
  adminLoading: false,
  adminError: null,

  updateVisibilityLoading: false,
  updateVisibilityError: null,
  updateVisibilitySuccess: false,

  productReviews: [],
  productReviewsPagination: null,
  productReviewsLoading: false,
  productReviewsError: null,
  productReviewStats: null,
  productReviewStatsLoading: false,
  productReviewStatsError: null,

  createReviewLoading: false,
  createReviewError: null,
  createReviewSuccess: false,

  updateReviewLoading: false,
  updateReviewError: null,
  updateReviewSuccess: false,

  deleteReviewLoading: false,
  deleteReviewError: null,
  deleteReviewSuccess: false,
};

const reviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ADMIN_REVIEWS_REQUEST:
      return {
        ...state,
        adminLoading: true,
        adminError: null,
      };
    case GET_ADMIN_REVIEWS_SUCCESS:
      return {
        ...state,
        adminLoading: false,
        adminReviews: action.payload.data || [],
        adminPagination: action.payload.pagination || null,
        adminError: null,
      };
    case GET_ADMIN_REVIEWS_FAILURE:
      return {
        ...state,
        adminLoading: false,
        adminError: action.payload,
      };

    case UPDATE_REVIEW_VISIBILITY_REQUEST:
      return {
        ...state,
        updateVisibilityLoading: true,
        updateVisibilityError: null,
        updateVisibilitySuccess: false,
      };
    case UPDATE_REVIEW_VISIBILITY_SUCCESS:
      return {
        ...state,
        updateVisibilityLoading: false,
        updateVisibilityError: null,
        updateVisibilitySuccess: true,
      };
    case UPDATE_REVIEW_VISIBILITY_FAILURE:
      return {
        ...state,
        updateVisibilityLoading: false,
        updateVisibilityError: action.payload,
        updateVisibilitySuccess: false,
      };

    case GET_PRODUCT_REVIEWS_REQUEST:
      return {
        ...state,
        productReviewsLoading: true,
        productReviewsError: null,
      };
    case GET_PRODUCT_REVIEWS_SUCCESS:
      return {
        ...state,
        productReviewsLoading: false,
        productReviews: action.payload.data || [],
        productReviewsPagination: action.payload.pagination || null,
        productReviewsError: null,
      };
    case GET_PRODUCT_REVIEWS_FAILURE:
      return {
        ...state,
        productReviewsLoading: false,
        productReviewsError: action.payload,
      };

    case GET_PRODUCT_REVIEW_STATS_REQUEST:
      return {
        ...state,
        productReviewStatsLoading: true,
        productReviewStatsError: null,
      };
    case GET_PRODUCT_REVIEW_STATS_SUCCESS:
      return {
        ...state,
        productReviewStatsLoading: false,
        productReviewStats: action.payload,
        productReviewStatsError: null,
      };
    case GET_PRODUCT_REVIEW_STATS_FAILURE:
      return {
        ...state,
        productReviewStatsLoading: false,
        productReviewStatsError: action.payload,
      };

    case CREATE_REVIEW_REQUEST:
      return {
        ...state,
        createReviewLoading: true,
        createReviewError: null,
        createReviewSuccess: false,
      };
    case CREATE_REVIEW_SUCCESS:
      return {
        ...state,
        createReviewLoading: false,
        createReviewError: null,
        createReviewSuccess: true,
      };
    case CREATE_REVIEW_FAILURE:
      return {
        ...state,
        createReviewLoading: false,
        createReviewError: action.payload,
        createReviewSuccess: false,
      };

    case UPDATE_REVIEW_REQUEST:
      return {
        ...state,
        updateReviewLoading: true,
        updateReviewError: null,
        updateReviewSuccess: false,
      };
    case UPDATE_REVIEW_SUCCESS:
      return {
        ...state,
        updateReviewLoading: false,
        updateReviewError: null,
        updateReviewSuccess: true,
      };
    case UPDATE_REVIEW_FAILURE:
      return {
        ...state,
        updateReviewLoading: false,
        updateReviewError: action.payload,
        updateReviewSuccess: false,
      };

    case DELETE_REVIEW_REQUEST:
      return {
        ...state,
        deleteReviewLoading: true,
        deleteReviewError: null,
        deleteReviewSuccess: false,
      };
    case DELETE_REVIEW_SUCCESS:
      return {
        ...state,
        deleteReviewLoading: false,
        deleteReviewError: null,
        deleteReviewSuccess: true,
      };
    case DELETE_REVIEW_FAILURE:
      return {
        ...state,
        deleteReviewLoading: false,
        deleteReviewError: action.payload,
        deleteReviewSuccess: false,
      };

    case CLEAR_REVIEW_MESSAGES:
      return {
        ...state,
        adminError: null,
        updateVisibilityError: null,
        updateVisibilitySuccess: false,
        productReviewsError: null,
        productReviewStatsError: null,
        createReviewError: null,
        createReviewSuccess: false,
        updateReviewError: null,
        updateReviewSuccess: false,
        deleteReviewError: null,
        deleteReviewSuccess: false,
      };

    default:
      return state;
  }
};

export default reviewReducer;
