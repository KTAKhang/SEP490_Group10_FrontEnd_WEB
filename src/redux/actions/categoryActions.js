// ===== CATEGORY ACTIONS =====
export const GET_CATEGORIES_REQUEST = "GET_CATEGORIES_REQUEST";
export const GET_CATEGORIES_SUCCESS = "GET_CATEGORIES_SUCCESS";
export const GET_CATEGORIES_FAILURE = "GET_CATEGORIES_FAILURE";

export const GET_CATEGORY_BY_ID_REQUEST = "GET_CATEGORY_BY_ID_REQUEST";
export const GET_CATEGORY_BY_ID_SUCCESS = "GET_CATEGORY_BY_ID_SUCCESS";
export const GET_CATEGORY_BY_ID_FAILURE = "GET_CATEGORY_BY_ID_FAILURE";

export const CREATE_CATEGORY_REQUEST = "CREATE_CATEGORY_REQUEST";
export const CREATE_CATEGORY_SUCCESS = "CREATE_CATEGORY_SUCCESS";
export const CREATE_CATEGORY_FAILURE = "CREATE_CATEGORY_FAILURE";

export const UPDATE_CATEGORY_REQUEST = "UPDATE_CATEGORY_REQUEST";
export const UPDATE_CATEGORY_SUCCESS = "UPDATE_CATEGORY_SUCCESS";
export const UPDATE_CATEGORY_FAILURE = "UPDATE_CATEGORY_FAILURE";

export const DELETE_CATEGORY_REQUEST = "DELETE_CATEGORY_REQUEST";
export const DELETE_CATEGORY_SUCCESS = "DELETE_CATEGORY_SUCCESS";
export const DELETE_CATEGORY_FAILURE = "DELETE_CATEGORY_FAILURE";

export const GET_CATEGORY_STATS_REQUEST = "GET_CATEGORY_STATS_REQUEST";
export const GET_CATEGORY_STATS_SUCCESS = "GET_CATEGORY_STATS_SUCCESS";
export const GET_CATEGORY_STATS_FAILURE = "GET_CATEGORY_STATS_FAILURE";

// ===== CLEAR MESSAGES =====
export const CLEAR_CATEGORY_MESSAGES = "CLEAR_CATEGORY_MESSAGES";

// ===== CATEGORY ACTION CREATORS =====
export const getCategoriesRequest = (params = {}) => ({
  type: GET_CATEGORIES_REQUEST,
  payload: params,
});

export const getCategoriesSuccess = (data) => ({
  type: GET_CATEGORIES_SUCCESS,
  payload: data,
});

export const getCategoriesFailure = (error) => ({
  type: GET_CATEGORIES_FAILURE,
  payload: error,
});

export const getCategoryByIdRequest = (id) => ({
  type: GET_CATEGORY_BY_ID_REQUEST,
  payload: id,
});

export const getCategoryByIdSuccess = (data) => ({
  type: GET_CATEGORY_BY_ID_SUCCESS,
  payload: data,
});

export const getCategoryByIdFailure = (error) => ({
  type: GET_CATEGORY_BY_ID_FAILURE,
  payload: error,
});

export const createCategoryRequest = (formData) => ({
  type: CREATE_CATEGORY_REQUEST,
  payload: formData,
});

export const createCategorySuccess = (data) => ({
  type: CREATE_CATEGORY_SUCCESS,
  payload: data,
});

export const createCategoryFailure = (error) => ({
  type: CREATE_CATEGORY_FAILURE,
  payload: error,
});

export const updateCategoryRequest = (id, formData) => ({
  type: UPDATE_CATEGORY_REQUEST,
  payload: { id, formData },
});

export const updateCategorySuccess = (data) => ({
  type: UPDATE_CATEGORY_SUCCESS,
  payload: data,
});

export const updateCategoryFailure = (error) => ({
  type: UPDATE_CATEGORY_FAILURE,
  payload: error,
});

export const deleteCategoryRequest = (id) => ({
  type: DELETE_CATEGORY_REQUEST,
  payload: id,
});

export const deleteCategorySuccess = (message) => ({
  type: DELETE_CATEGORY_SUCCESS,
  payload: message,
});

export const deleteCategoryFailure = (error) => ({
  type: DELETE_CATEGORY_FAILURE,
  payload: error,
});

export const getCategoryStatsRequest = () => ({
  type: GET_CATEGORY_STATS_REQUEST,
});

export const getCategoryStatsSuccess = (data) => ({
  type: GET_CATEGORY_STATS_SUCCESS,
  payload: data,
});

export const getCategoryStatsFailure = (error) => ({
  type: GET_CATEGORY_STATS_FAILURE,
  payload: error,
});

// ===== CLEAR MESSAGES =====
export const clearCategoryMessages = () => ({
  type: CLEAR_CATEGORY_MESSAGES,
});
