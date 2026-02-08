import {
  NEWS_GET_NEWS_REQUEST,
  NEWS_GET_NEWS_SUCCESS,
  NEWS_GET_NEWS_FAILURE,
  NEWS_GET_NEWS_BY_ID_REQUEST,
  NEWS_GET_NEWS_BY_ID_SUCCESS,
  NEWS_GET_NEWS_BY_ID_FAILURE,
  NEWS_CREATE_NEWS_REQUEST,
  NEWS_CREATE_NEWS_SUCCESS,
  NEWS_CREATE_NEWS_FAILURE,
  NEWS_UPDATE_NEWS_REQUEST,
  NEWS_UPDATE_NEWS_SUCCESS,
  NEWS_UPDATE_NEWS_FAILURE,
  NEWS_DELETE_NEWS_REQUEST,
  NEWS_DELETE_NEWS_SUCCESS,
  NEWS_DELETE_NEWS_FAILURE,
  NEWS_GET_FEATURED_REQUEST,
  NEWS_GET_FEATURED_SUCCESS,
  NEWS_GET_FEATURED_FAILURE,
  NEWS_CLEAR_MESSAGES,
  NEWS_UPLOAD_CONTENT_IMAGE_REQUEST,
  NEWS_UPLOAD_CONTENT_IMAGE_SUCCESS,
  NEWS_UPLOAD_CONTENT_IMAGE_FAILURE,
} from "../actions/newsActions";

const initialState = {
  // News List
  newsList: [],
  newsListLoading: false,
  newsListError: null,
  newsPagination: null,

  // News Detail
  newsDetail: null,
  newsDetailLoading: false,
  newsDetailError: null,

  // Create News
  createNewsLoading: false,
  createNewsSuccess: false,
  createNewsError: null,
  createNewsMessage: null,

  // Update News
  updateNewsLoading: false,
  updateNewsSuccess: false,
  updateNewsError: null,
  updateNewsMessage: null,

  // Delete News
  deleteNewsLoading: false,
  deleteNewsSuccess: false,
  deleteNewsError: null,
  deleteNewsMessage: null,

  // Featured News
  featuredNews: [],
  featuredNewsLoading: false,
  featuredNewsError: null,

  // Upload Content Image
  uploadContentImageLoading: false,
  uploadContentImageSuccess: false,
  uploadContentImageError: null,
  uploadContentImageUrl: null,
};

const newsReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== GET NEWS LIST =====
    case NEWS_GET_NEWS_REQUEST:
      return {
        ...state,
        newsListLoading: true,
        newsListError: null,
      };
    case NEWS_GET_NEWS_SUCCESS:
      return {
        ...state,
        newsList: action.payload.data || [],
        newsPagination: action.payload.pagination || null,
        newsListLoading: false,
        newsListError: null,
      };
    case NEWS_GET_NEWS_FAILURE:
      return {
        ...state,
        newsListLoading: false,
        newsListError: action.payload,
      };

    // ===== GET NEWS BY ID =====
    case NEWS_GET_NEWS_BY_ID_REQUEST:
      return {
        ...state,
        newsDetailLoading: true,
        newsDetailError: null,
      };
    case NEWS_GET_NEWS_BY_ID_SUCCESS:
      return {
        ...state,
        newsDetail: action.payload,
        newsDetailLoading: false,
        newsDetailError: null,
      };
    case NEWS_GET_NEWS_BY_ID_FAILURE:
      return {
        ...state,
        newsDetail: null,
        newsDetailLoading: false,
        newsDetailError: action.payload,
      };

    // ===== CREATE NEWS =====
    case NEWS_CREATE_NEWS_REQUEST:
      return {
        ...state,
        createNewsLoading: true,
        createNewsSuccess: false,
        createNewsError: null,
        createNewsMessage: null,
      };
    case NEWS_CREATE_NEWS_SUCCESS:
      return {
        ...state,
        createNewsLoading: false,
        createNewsSuccess: true,
        createNewsError: null,
        createNewsMessage: action.payload.message || "News created successfully",
      };
    case NEWS_CREATE_NEWS_FAILURE:
      return {
        ...state,
        createNewsLoading: false,
        createNewsSuccess: false,
        createNewsError: action.payload,
        createNewsMessage: null,
      };

    // ===== UPDATE NEWS =====
    case NEWS_UPDATE_NEWS_REQUEST:
      return {
        ...state,
        updateNewsLoading: true,
        updateNewsSuccess: false,
        updateNewsError: null,
        updateNewsMessage: null,
      };
    case NEWS_UPDATE_NEWS_SUCCESS:
      return {
        ...state,
        updateNewsLoading: false,
        updateNewsSuccess: true,
        updateNewsError: null,
        updateNewsMessage: action.payload.message || "News updated successfully",
        newsDetail: action.payload.data || state.newsDetail,
      };
    case NEWS_UPDATE_NEWS_FAILURE:
      return {
        ...state,
        updateNewsLoading: false,
        updateNewsSuccess: false,
        updateNewsError: action.payload,
        updateNewsMessage: null,
      };

    // ===== DELETE NEWS =====
    case NEWS_DELETE_NEWS_REQUEST:
      return {
        ...state,
        deleteNewsLoading: true,
        deleteNewsSuccess: false,
        deleteNewsError: null,
        deleteNewsMessage: null,
      };
    case NEWS_DELETE_NEWS_SUCCESS:
      return {
        ...state,
        deleteNewsLoading: false,
        deleteNewsSuccess: true,
        deleteNewsError: null,
        deleteNewsMessage: action.payload?.message || "News deleted successfully",
      };
    case NEWS_DELETE_NEWS_FAILURE:
      return {
        ...state,
        deleteNewsLoading: false,
        deleteNewsSuccess: false,
        deleteNewsError: action.payload,
        deleteNewsMessage: null,
      };

    // ===== GET FEATURED NEWS =====
    case NEWS_GET_FEATURED_REQUEST:
      return {
        ...state,
        featuredNewsLoading: true,
        featuredNewsError: null,
      };
    case NEWS_GET_FEATURED_SUCCESS:
      return {
        ...state,
        featuredNews: action.payload || [],
        featuredNewsLoading: false,
        featuredNewsError: null,
      };
    case NEWS_GET_FEATURED_FAILURE:
      return {
        ...state,
        featuredNewsLoading: false,
        featuredNewsError: action.payload,
      };

    // ===== UPLOAD CONTENT IMAGE =====
    case NEWS_UPLOAD_CONTENT_IMAGE_REQUEST:
      return {
        ...state,
        uploadContentImageLoading: true,
        uploadContentImageSuccess: false,
        uploadContentImageError: null,
        uploadContentImageUrl: null,
      };
    case NEWS_UPLOAD_CONTENT_IMAGE_SUCCESS:
      return {
        ...state,
        uploadContentImageLoading: false,
        uploadContentImageSuccess: true,
        uploadContentImageError: null,
        uploadContentImageUrl: action.payload.url,
      };
    case NEWS_UPLOAD_CONTENT_IMAGE_FAILURE:
      return {
        ...state,
        uploadContentImageLoading: false,
        uploadContentImageSuccess: false,
        uploadContentImageError: action.payload,
        uploadContentImageUrl: null,
      };

    // ===== CLEAR MESSAGES =====
    case NEWS_CLEAR_MESSAGES:
      return {
        ...state,
        createNewsSuccess: false,
        createNewsError: null,
        createNewsMessage: null,
        updateNewsSuccess: false,
        updateNewsError: null,
        updateNewsMessage: null,
        deleteNewsSuccess: false,
        deleteNewsError: null,
        deleteNewsMessage: null,
        uploadContentImageSuccess: false,
        uploadContentImageError: null,
        uploadContentImageUrl: null,
      };

    default:
      return state;
  }
};

export default newsReducer;
