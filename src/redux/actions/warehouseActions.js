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

// ===== UPDATE PRODUCT EXPIRY DATE ACTIONS =====
export const UPDATE_PRODUCT_EXPIRY_DATE_REQUEST = "UPDATE_PRODUCT_EXPIRY_DATE_REQUEST";
export const UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS = "UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS";
export const UPDATE_PRODUCT_EXPIRY_DATE_FAILURE = "UPDATE_PRODUCT_EXPIRY_DATE_FAILURE";

// ===== INVENTORY TRANSACTION ACTIONS =====
export const CREATE_RECEIPT_REQUEST = "CREATE_RECEIPT_REQUEST";
export const CREATE_RECEIPT_SUCCESS = "CREATE_RECEIPT_SUCCESS";
export const CREATE_RECEIPT_FAILURE = "CREATE_RECEIPT_FAILURE";

// ===== CLEAR MESSAGES =====
export const CLEAR_WAREHOUSE_MESSAGES = "CLEAR_WAREHOUSE_MESSAGES";

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

// ===== INVENTORY TRANSACTION ACTION CREATORS =====
export const createReceiptRequest = (formData) => ({
  type: CREATE_RECEIPT_REQUEST,
  payload: formData,
});

export const createReceiptSuccess = (data) => ({
  type: CREATE_RECEIPT_SUCCESS,
  payload: data,
});

export const createReceiptFailure = (error) => ({
  type: CREATE_RECEIPT_FAILURE,
  payload: error,
});

// ===== UPDATE PRODUCT EXPIRY DATE ACTION CREATORS =====
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
export const clearWarehouseMessages = () => ({
  type: CLEAR_WAREHOUSE_MESSAGES,
});
