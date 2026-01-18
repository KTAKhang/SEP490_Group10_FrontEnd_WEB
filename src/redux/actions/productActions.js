// ===== PRODUCT ACTIONS =====
export const GET_PRODUCTS_REQUEST = "GET_PRODUCTS_REQUEST";
export const GET_PRODUCTS_SUCCESS = "GET_PRODUCTS_SUCCESS";
export const GET_PRODUCTS_FAILURE = "GET_PRODUCTS_FAILURE";

export const GET_PRODUCT_BY_ID_REQUEST = "GET_PRODUCT_BY_ID_REQUEST";
export const GET_PRODUCT_BY_ID_SUCCESS = "GET_PRODUCT_BY_ID_SUCCESS";
export const GET_PRODUCT_BY_ID_FAILURE = "GET_PRODUCT_BY_ID_FAILURE";

export const CREATE_PRODUCT_REQUEST = "CREATE_PRODUCT_REQUEST";
export const CREATE_PRODUCT_SUCCESS = "CREATE_PRODUCT_SUCCESS";
export const CREATE_PRODUCT_FAILURE = "CREATE_PRODUCT_FAILURE";

export const UPDATE_PRODUCT_REQUEST = "UPDATE_PRODUCT_REQUEST";
export const UPDATE_PRODUCT_SUCCESS = "UPDATE_PRODUCT_SUCCESS";
export const UPDATE_PRODUCT_FAILURE = "UPDATE_PRODUCT_FAILURE";

export const DELETE_PRODUCT_REQUEST = "DELETE_PRODUCT_REQUEST";
export const DELETE_PRODUCT_SUCCESS = "DELETE_PRODUCT_SUCCESS";
export const DELETE_PRODUCT_FAILURE = "DELETE_PRODUCT_FAILURE";

export const GET_PRODUCT_STATS_REQUEST = "GET_PRODUCT_STATS_REQUEST";
export const GET_PRODUCT_STATS_SUCCESS = "GET_PRODUCT_STATS_SUCCESS";
export const GET_PRODUCT_STATS_FAILURE = "GET_PRODUCT_STATS_FAILURE";

export const UPDATE_PRODUCT_EXPIRY_DATE_REQUEST = "UPDATE_PRODUCT_EXPIRY_DATE_REQUEST";
export const UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS = "UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS";
export const UPDATE_PRODUCT_EXPIRY_DATE_FAILURE = "UPDATE_PRODUCT_EXPIRY_DATE_FAILURE";

// ===== CLEAR MESSAGES =====
export const CLEAR_PRODUCT_MESSAGES = "CLEAR_PRODUCT_MESSAGES";

// ===== PRODUCT ACTION CREATORS =====
export const getProductsRequest = (params = {}) => ({
  type: GET_PRODUCTS_REQUEST,
  payload: params,
});

export const getProductsSuccess = (data) => ({
  type: GET_PRODUCTS_SUCCESS,
  payload: data,
});

export const getProductsFailure = (error) => ({
  type: GET_PRODUCTS_FAILURE,
  payload: error,
});

export const getProductByIdRequest = (id) => ({
  type: GET_PRODUCT_BY_ID_REQUEST,
  payload: id,
});

export const getProductByIdSuccess = (data) => ({
  type: GET_PRODUCT_BY_ID_SUCCESS,
  payload: data,
});

export const getProductByIdFailure = (error) => ({
  type: GET_PRODUCT_BY_ID_FAILURE,
  payload: error,
});

export const createProductRequest = (formData) => ({
  type: CREATE_PRODUCT_REQUEST,
  payload: formData,
});

export const createProductSuccess = (data) => ({
  type: CREATE_PRODUCT_SUCCESS,
  payload: data,
});

export const createProductFailure = (error) => ({
  type: CREATE_PRODUCT_FAILURE,
  payload: error,
});

export const updateProductRequest = (id, formData) => ({
  type: UPDATE_PRODUCT_REQUEST,
  payload: { id, formData },
});

export const updateProductSuccess = (data) => ({
  type: UPDATE_PRODUCT_SUCCESS,
  payload: data,
});

export const updateProductFailure = (error) => ({
  type: UPDATE_PRODUCT_FAILURE,
  payload: error,
});

export const deleteProductRequest = (id) => ({
  type: DELETE_PRODUCT_REQUEST,
  payload: id,
});

export const deleteProductSuccess = (message) => ({
  type: DELETE_PRODUCT_SUCCESS,
  payload: message,
});

export const deleteProductFailure = (error) => ({
  type: DELETE_PRODUCT_FAILURE,
  payload: error,
});

export const getProductStatsRequest = () => ({
  type: GET_PRODUCT_STATS_REQUEST,
});

export const getProductStatsSuccess = (data) => ({
  type: GET_PRODUCT_STATS_SUCCESS,
  payload: data,
});

export const getProductStatsFailure = (error) => ({
  type: GET_PRODUCT_STATS_FAILURE,
  payload: error,
});

export const updateProductExpiryDateRequest = (id, expiryDate) => ({
  type: UPDATE_PRODUCT_EXPIRY_DATE_REQUEST,
  payload: { id, expiryDate },
});

export const updateProductExpiryDateSuccess = (data) => ({
  type: UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS,
  payload: data,
});

export const updateProductExpiryDateFailure = (error) => ({
  type: UPDATE_PRODUCT_EXPIRY_DATE_FAILURE,
  payload: error,
});

// ===== CLEAR MESSAGES =====
export const clearProductMessages = () => ({
  type: CLEAR_PRODUCT_MESSAGES,
});
