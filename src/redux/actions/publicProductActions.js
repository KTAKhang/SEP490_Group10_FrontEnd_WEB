// Public Product Actions (no authentication required)

export const GET_FEATURED_PRODUCTS_REQUEST = "GET_FEATURED_PRODUCTS_REQUEST";
export const GET_FEATURED_PRODUCTS_SUCCESS = "GET_FEATURED_PRODUCTS_SUCCESS";
export const GET_FEATURED_PRODUCTS_FAILURE = "GET_FEATURED_PRODUCTS_FAILURE";

export const GET_PUBLIC_PRODUCTS_REQUEST = "GET_PUBLIC_PRODUCTS_REQUEST";
export const GET_PUBLIC_PRODUCTS_SUCCESS = "GET_PUBLIC_PRODUCTS_SUCCESS";
export const GET_PUBLIC_PRODUCTS_FAILURE = "GET_PUBLIC_PRODUCTS_FAILURE";

export const GET_PUBLIC_PRODUCT_BY_ID_REQUEST = "GET_PUBLIC_PRODUCT_BY_ID_REQUEST";
export const GET_PUBLIC_PRODUCT_BY_ID_SUCCESS = "GET_PUBLIC_PRODUCT_BY_ID_SUCCESS";
export const GET_PUBLIC_PRODUCT_BY_ID_FAILURE = "GET_PUBLIC_PRODUCT_BY_ID_FAILURE";

export const CLEAR_PUBLIC_PRODUCT_MESSAGES = "CLEAR_PUBLIC_PRODUCT_MESSAGES";

// Action creators
export const getFeaturedProductsRequest = () => ({
  type: GET_FEATURED_PRODUCTS_REQUEST,
});

export const getFeaturedProductsSuccess = (data) => ({
  type: GET_FEATURED_PRODUCTS_SUCCESS,
  payload: data,
});

export const getFeaturedProductsFailure = (error) => ({
  type: GET_FEATURED_PRODUCTS_FAILURE,
  payload: error,
});

export const getPublicProductsRequest = (params) => ({
  type: GET_PUBLIC_PRODUCTS_REQUEST,
  payload: params,
});

export const getPublicProductsSuccess = (data) => ({
  type: GET_PUBLIC_PRODUCTS_SUCCESS,
  payload: data,
});

export const getPublicProductsFailure = (error) => ({
  type: GET_PUBLIC_PRODUCTS_FAILURE,
  payload: error,
});

export const getPublicProductByIdRequest = (id) => ({
  type: GET_PUBLIC_PRODUCT_BY_ID_REQUEST,
  payload: id,
});

export const getPublicProductByIdSuccess = (data) => ({
  type: GET_PUBLIC_PRODUCT_BY_ID_SUCCESS,
  payload: data,
});

export const getPublicProductByIdFailure = (error) => ({
  type: GET_PUBLIC_PRODUCT_BY_ID_FAILURE,
  payload: error,
});

export const clearPublicProductMessages = () => ({
  type: CLEAR_PUBLIC_PRODUCT_MESSAGES,
});
