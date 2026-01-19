// ===== SHOP ACTIONS =====
export const GET_SHOP_INFO_REQUEST = "GET_SHOP_INFO_REQUEST";
export const GET_SHOP_INFO_SUCCESS = "GET_SHOP_INFO_SUCCESS";
export const GET_SHOP_INFO_FAILURE = "GET_SHOP_INFO_FAILURE";

export const GET_SHOP_INFO_PUBLIC_REQUEST = "GET_SHOP_INFO_PUBLIC_REQUEST";
export const GET_SHOP_INFO_PUBLIC_SUCCESS = "GET_SHOP_INFO_PUBLIC_SUCCESS";
export const GET_SHOP_INFO_PUBLIC_FAILURE = "GET_SHOP_INFO_PUBLIC_FAILURE";

export const UPDATE_SHOP_BASIC_INFO_REQUEST = "UPDATE_SHOP_BASIC_INFO_REQUEST";
export const UPDATE_SHOP_BASIC_INFO_SUCCESS = "UPDATE_SHOP_BASIC_INFO_SUCCESS";
export const UPDATE_SHOP_BASIC_INFO_FAILURE = "UPDATE_SHOP_BASIC_INFO_FAILURE";

export const UPDATE_SHOP_DESCRIPTION_REQUEST = "UPDATE_SHOP_DESCRIPTION_REQUEST";
export const UPDATE_SHOP_DESCRIPTION_SUCCESS = "UPDATE_SHOP_DESCRIPTION_SUCCESS";
export const UPDATE_SHOP_DESCRIPTION_FAILURE = "UPDATE_SHOP_DESCRIPTION_FAILURE";

export const UPDATE_SHOP_WORKING_HOURS_REQUEST = "UPDATE_SHOP_WORKING_HOURS_REQUEST";
export const UPDATE_SHOP_WORKING_HOURS_SUCCESS = "UPDATE_SHOP_WORKING_HOURS_SUCCESS";
export const UPDATE_SHOP_WORKING_HOURS_FAILURE = "UPDATE_SHOP_WORKING_HOURS_FAILURE";

export const UPDATE_SHOP_IMAGES_REQUEST = "UPDATE_SHOP_IMAGES_REQUEST";
export const UPDATE_SHOP_IMAGES_SUCCESS = "UPDATE_SHOP_IMAGES_SUCCESS";
export const UPDATE_SHOP_IMAGES_FAILURE = "UPDATE_SHOP_IMAGES_FAILURE";

export const CLEAR_SHOP_MESSAGES = "CLEAR_SHOP_MESSAGES";

// ===== ACTION CREATORS =====
export const getShopInfoRequest = () => ({
  type: GET_SHOP_INFO_REQUEST,
});

export const getShopInfoSuccess = (data) => ({
  type: GET_SHOP_INFO_SUCCESS,
  payload: data,
});

export const getShopInfoFailure = (error) => ({
  type: GET_SHOP_INFO_FAILURE,
  payload: error,
});

export const getShopInfoPublicRequest = () => ({
  type: GET_SHOP_INFO_PUBLIC_REQUEST,
});

export const getShopInfoPublicSuccess = (data) => ({
  type: GET_SHOP_INFO_PUBLIC_SUCCESS,
  payload: data,
});

export const getShopInfoPublicFailure = (error) => ({
  type: GET_SHOP_INFO_PUBLIC_FAILURE,
  payload: error,
});

export const updateShopBasicInfoRequest = (formData) => ({
  type: UPDATE_SHOP_BASIC_INFO_REQUEST,
  payload: formData,
});

export const updateShopBasicInfoSuccess = (data) => ({
  type: UPDATE_SHOP_BASIC_INFO_SUCCESS,
  payload: data,
});

export const updateShopBasicInfoFailure = (error) => ({
  type: UPDATE_SHOP_BASIC_INFO_FAILURE,
  payload: error,
});

export const updateShopDescriptionRequest = (description) => ({
  type: UPDATE_SHOP_DESCRIPTION_REQUEST,
  payload: { description },
});

export const updateShopDescriptionSuccess = (data) => ({
  type: UPDATE_SHOP_DESCRIPTION_SUCCESS,
  payload: data,
});

export const updateShopDescriptionFailure = (error) => ({
  type: UPDATE_SHOP_DESCRIPTION_FAILURE,
  payload: error,
});

export const updateShopWorkingHoursRequest = (workingHours) => ({
  type: UPDATE_SHOP_WORKING_HOURS_REQUEST,
  payload: { workingHours },
});

export const updateShopWorkingHoursSuccess = (data) => ({
  type: UPDATE_SHOP_WORKING_HOURS_SUCCESS,
  payload: data,
});

export const updateShopWorkingHoursFailure = (error) => ({
  type: UPDATE_SHOP_WORKING_HOURS_FAILURE,
  payload: error,
});

export const updateShopImagesRequest = (images, imagePublicIds) => ({
  type: UPDATE_SHOP_IMAGES_REQUEST,
  payload: { images, imagePublicIds },
});

export const updateShopImagesSuccess = (data) => ({
  type: UPDATE_SHOP_IMAGES_SUCCESS,
  payload: data,
});

export const updateShopImagesFailure = (error) => ({
  type: UPDATE_SHOP_IMAGES_FAILURE,
  payload: error,
});

export const clearShopMessages = () => ({
  type: CLEAR_SHOP_MESSAGES,
});
