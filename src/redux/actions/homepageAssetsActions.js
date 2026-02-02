// ===== HOMEPAGE ASSETS ACTIONS =====
export const GET_HOMEPAGE_ASSETS_REQUEST = "GET_HOMEPAGE_ASSETS_REQUEST";
export const GET_HOMEPAGE_ASSETS_SUCCESS = "GET_HOMEPAGE_ASSETS_SUCCESS";
export const GET_HOMEPAGE_ASSETS_FAILURE = "GET_HOMEPAGE_ASSETS_FAILURE";

export const GET_HOMEPAGE_ASSETS_PUBLIC_REQUEST = "GET_HOMEPAGE_ASSETS_PUBLIC_REQUEST";
export const GET_HOMEPAGE_ASSETS_PUBLIC_SUCCESS = "GET_HOMEPAGE_ASSETS_PUBLIC_SUCCESS";
export const GET_HOMEPAGE_ASSETS_PUBLIC_FAILURE = "GET_HOMEPAGE_ASSETS_PUBLIC_FAILURE";

export const UPDATE_HOMEPAGE_ASSET_REQUEST = "UPDATE_HOMEPAGE_ASSET_REQUEST";
export const UPDATE_HOMEPAGE_ASSET_SUCCESS = "UPDATE_HOMEPAGE_ASSET_SUCCESS";
export const UPDATE_HOMEPAGE_ASSET_FAILURE = "UPDATE_HOMEPAGE_ASSET_FAILURE";

export const CLEAR_HOMEPAGE_ASSETS_MESSAGES = "CLEAR_HOMEPAGE_ASSETS_MESSAGES";

// ===== ACTION CREATORS =====
export const getHomepageAssetsRequest = () => ({
  type: GET_HOMEPAGE_ASSETS_REQUEST,
});

export const getHomepageAssetsSuccess = (data) => ({
  type: GET_HOMEPAGE_ASSETS_SUCCESS,
  payload: data,
});

export const getHomepageAssetsFailure = (error) => ({
  type: GET_HOMEPAGE_ASSETS_FAILURE,
  payload: error,
});

export const getHomepageAssetsPublicRequest = () => ({
  type: GET_HOMEPAGE_ASSETS_PUBLIC_REQUEST,
});

export const getHomepageAssetsPublicSuccess = (data) => ({
  type: GET_HOMEPAGE_ASSETS_PUBLIC_SUCCESS,
  payload: data,
});

export const getHomepageAssetsPublicFailure = (error) => ({
  type: GET_HOMEPAGE_ASSETS_PUBLIC_FAILURE,
  payload: error,
});

export const updateHomepageAssetRequest = (key, imageUrl, altText) => ({
  type: UPDATE_HOMEPAGE_ASSET_REQUEST,
  payload: { key, imageUrl, altText },
});

export const updateHomepageAssetSuccess = (data) => ({
  type: UPDATE_HOMEPAGE_ASSET_SUCCESS,
  payload: data,
});

export const updateHomepageAssetFailure = (error) => ({
  type: UPDATE_HOMEPAGE_ASSET_FAILURE,
  payload: error,
});

export const clearHomepageAssetsMessages = () => ({
  type: CLEAR_HOMEPAGE_ASSETS_MESSAGES,
});
