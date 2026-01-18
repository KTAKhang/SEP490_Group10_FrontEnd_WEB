// Public Category Actions (no authentication required)

export const GET_PUBLIC_CATEGORIES_REQUEST = "GET_PUBLIC_CATEGORIES_REQUEST";
export const GET_PUBLIC_CATEGORIES_SUCCESS = "GET_PUBLIC_CATEGORIES_SUCCESS";
export const GET_PUBLIC_CATEGORIES_FAILURE = "GET_PUBLIC_CATEGORIES_FAILURE";

export const CLEAR_PUBLIC_CATEGORY_MESSAGES = "CLEAR_PUBLIC_CATEGORY_MESSAGES";

// Action creators
export const getPublicCategoriesRequest = (params) => ({
  type: GET_PUBLIC_CATEGORIES_REQUEST,
  payload: params,
});

export const getPublicCategoriesSuccess = (data) => ({
  type: GET_PUBLIC_CATEGORIES_SUCCESS,
  payload: data,
});

export const getPublicCategoriesFailure = (error) => ({
  type: GET_PUBLIC_CATEGORIES_FAILURE,
  payload: error,
});

export const clearPublicCategoryMessages = () => ({
  type: CLEAR_PUBLIC_CATEGORY_MESSAGES,
});
