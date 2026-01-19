import {
  GET_SHOP_INFO_REQUEST,
  GET_SHOP_INFO_SUCCESS,
  GET_SHOP_INFO_FAILURE,
  GET_SHOP_INFO_PUBLIC_REQUEST,
  GET_SHOP_INFO_PUBLIC_SUCCESS,
  GET_SHOP_INFO_PUBLIC_FAILURE,
  UPDATE_SHOP_BASIC_INFO_REQUEST,
  UPDATE_SHOP_BASIC_INFO_SUCCESS,
  UPDATE_SHOP_BASIC_INFO_FAILURE,
  UPDATE_SHOP_DESCRIPTION_REQUEST,
  UPDATE_SHOP_DESCRIPTION_SUCCESS,
  UPDATE_SHOP_DESCRIPTION_FAILURE,
  UPDATE_SHOP_WORKING_HOURS_REQUEST,
  UPDATE_SHOP_WORKING_HOURS_SUCCESS,
  UPDATE_SHOP_WORKING_HOURS_FAILURE,
  UPDATE_SHOP_IMAGES_REQUEST,
  UPDATE_SHOP_IMAGES_SUCCESS,
  UPDATE_SHOP_IMAGES_FAILURE,
  CLEAR_SHOP_MESSAGES,
} from "../actions/shopActions";

const initialState = {
  shopInfo: null,
  publicShopInfo: null,
  loading: false,
  getShopInfoLoading: false,
  getShopInfoPublicLoading: false,
  updateBasicInfoLoading: false,
  updateDescriptionLoading: false,
  updateWorkingHoursLoading: false,
  updateImagesLoading: false,
  success: null,
  error: null,
};

const shopReducer = (state = initialState, action) => {
  switch (action.type) {
    // Get Shop Info
    case GET_SHOP_INFO_REQUEST:
      return {
        ...state,
        getShopInfoLoading: true,
        error: null,
      };
    case GET_SHOP_INFO_SUCCESS:
      return {
        ...state,
        getShopInfoLoading: false,
        shopInfo: action.payload,
        error: null,
      };
    case GET_SHOP_INFO_FAILURE:
      return {
        ...state,
        getShopInfoLoading: false,
        error: action.payload,
      };

    // Get Shop Info Public
    case GET_SHOP_INFO_PUBLIC_REQUEST:
      return {
        ...state,
        getShopInfoPublicLoading: true,
        error: null,
      };
    case GET_SHOP_INFO_PUBLIC_SUCCESS:
      return {
        ...state,
        getShopInfoPublicLoading: false,
        publicShopInfo: action.payload,
        error: null,
      };
    case GET_SHOP_INFO_PUBLIC_FAILURE:
      return {
        ...state,
        getShopInfoPublicLoading: false,
        error: action.payload,
      };

    // Update Basic Info
    case UPDATE_SHOP_BASIC_INFO_REQUEST:
      return {
        ...state,
        updateBasicInfoLoading: true,
        error: null,
        success: null,
      };
    case UPDATE_SHOP_BASIC_INFO_SUCCESS:
      return {
        ...state,
        updateBasicInfoLoading: false,
        shopInfo: action.payload,
        success: "Cập nhật thông tin cơ bản thành công",
        error: null,
      };
    case UPDATE_SHOP_BASIC_INFO_FAILURE:
      return {
        ...state,
        updateBasicInfoLoading: false,
        error: action.payload,
        success: null,
      };

    // Update Description
    case UPDATE_SHOP_DESCRIPTION_REQUEST:
      return {
        ...state,
        updateDescriptionLoading: true,
        error: null,
        success: null,
      };
    case UPDATE_SHOP_DESCRIPTION_SUCCESS:
      return {
        ...state,
        updateDescriptionLoading: false,
        shopInfo: action.payload,
        success: "Cập nhật mô tả thành công",
        error: null,
      };
    case UPDATE_SHOP_DESCRIPTION_FAILURE:
      return {
        ...state,
        updateDescriptionLoading: false,
        error: action.payload,
        success: null,
      };

    // Update Working Hours
    case UPDATE_SHOP_WORKING_HOURS_REQUEST:
      return {
        ...state,
        updateWorkingHoursLoading: true,
        error: null,
        success: null,
      };
    case UPDATE_SHOP_WORKING_HOURS_SUCCESS:
      return {
        ...state,
        updateWorkingHoursLoading: false,
        shopInfo: action.payload,
        success: "Cập nhật giờ hoạt động thành công",
        error: null,
      };
    case UPDATE_SHOP_WORKING_HOURS_FAILURE:
      return {
        ...state,
        updateWorkingHoursLoading: false,
        error: action.payload,
        success: null,
      };

    // Update Images
    case UPDATE_SHOP_IMAGES_REQUEST:
      return {
        ...state,
        updateImagesLoading: true,
        error: null,
        success: null,
      };
    case UPDATE_SHOP_IMAGES_SUCCESS:
      return {
        ...state,
        updateImagesLoading: false,
        shopInfo: action.payload,
        success: "Cập nhật ảnh shop thành công",
        error: null,
      };
    case UPDATE_SHOP_IMAGES_FAILURE:
      return {
        ...state,
        updateImagesLoading: false,
        error: action.payload,
        success: null,
      };

    // Clear Messages
    case CLEAR_SHOP_MESSAGES:
      return {
        ...state,
        success: null,
        error: null,
      };

    default:
      return state;
  }
};

export default shopReducer;
