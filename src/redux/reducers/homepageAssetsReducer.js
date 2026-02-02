import {
  GET_HOMEPAGE_ASSETS_REQUEST,
  GET_HOMEPAGE_ASSETS_SUCCESS,
  GET_HOMEPAGE_ASSETS_FAILURE,
  GET_HOMEPAGE_ASSETS_PUBLIC_REQUEST,
  GET_HOMEPAGE_ASSETS_PUBLIC_SUCCESS,
  GET_HOMEPAGE_ASSETS_PUBLIC_FAILURE,
  UPDATE_HOMEPAGE_ASSET_REQUEST,
  UPDATE_HOMEPAGE_ASSET_SUCCESS,
  UPDATE_HOMEPAGE_ASSET_FAILURE,
  CLEAR_HOMEPAGE_ASSETS_MESSAGES,
} from "../actions/homepageAssetsActions";

const initialState = {
  assets: null, // Admin view
  publicAssets: null, // Public view
  loading: false,
  getAssetsLoading: false,
  getPublicAssetsLoading: false,
  updateAssetLoading: false,
  success: null,
  error: null,
};

const homepageAssetsReducer = (state = initialState, action) => {
  switch (action.type) {
    // Get Homepage Assets (Admin)
    case GET_HOMEPAGE_ASSETS_REQUEST:
      return {
        ...state,
        getAssetsLoading: true,
        error: null,
      };
    case GET_HOMEPAGE_ASSETS_SUCCESS:
      return {
        ...state,
        getAssetsLoading: false,
        assets: action.payload,
        error: null,
      };
    case GET_HOMEPAGE_ASSETS_FAILURE:
      return {
        ...state,
        getAssetsLoading: false,
        error: action.payload,
      };

    // Get Homepage Assets Public
    case GET_HOMEPAGE_ASSETS_PUBLIC_REQUEST:
      return {
        ...state,
        getPublicAssetsLoading: true,
        error: null,
      };
    case GET_HOMEPAGE_ASSETS_PUBLIC_SUCCESS:
      return {
        ...state,
        getPublicAssetsLoading: false,
        publicAssets: action.payload,
        error: null,
      };
    case GET_HOMEPAGE_ASSETS_PUBLIC_FAILURE:
      return {
        ...state,
        getPublicAssetsLoading: false,
        error: action.payload,
      };

    // Update Homepage Asset
    case UPDATE_HOMEPAGE_ASSET_REQUEST:
      return {
        ...state,
        updateAssetLoading: true,
        error: null,
        success: null,
      };
    case UPDATE_HOMEPAGE_ASSET_SUCCESS:
      return {
        ...state,
        updateAssetLoading: false,
        assets: action.payload,
        success: "Cập nhật hình ảnh thành công",
        error: null,
      };
    case UPDATE_HOMEPAGE_ASSET_FAILURE:
      return {
        ...state,
        updateAssetLoading: false,
        error: action.payload,
        success: null,
      };

    // Clear Messages
    case CLEAR_HOMEPAGE_ASSETS_MESSAGES:
      return {
        ...state,
        success: null,
        error: null,
      };

    default:
      return state;
  }
};

export default homepageAssetsReducer;
