// Review Actions

export const GET_ADMIN_REVIEWS_REQUEST = "GET_ADMIN_REVIEWS_REQUEST";
export const GET_ADMIN_REVIEWS_SUCCESS = "GET_ADMIN_REVIEWS_SUCCESS";
export const GET_ADMIN_REVIEWS_FAILURE = "GET_ADMIN_REVIEWS_FAILURE";

export const UPDATE_REVIEW_VISIBILITY_REQUEST = "UPDATE_REVIEW_VISIBILITY_REQUEST";
export const UPDATE_REVIEW_VISIBILITY_SUCCESS = "UPDATE_REVIEW_VISIBILITY_SUCCESS";
export const UPDATE_REVIEW_VISIBILITY_FAILURE = "UPDATE_REVIEW_VISIBILITY_FAILURE";

export const GET_PRODUCT_REVIEWS_REQUEST = "GET_PRODUCT_REVIEWS_REQUEST";
export const GET_PRODUCT_REVIEWS_SUCCESS = "GET_PRODUCT_REVIEWS_SUCCESS";
export const GET_PRODUCT_REVIEWS_FAILURE = "GET_PRODUCT_REVIEWS_FAILURE";

export const GET_PRODUCT_REVIEW_STATS_REQUEST = "GET_PRODUCT_REVIEW_STATS_REQUEST";
export const GET_PRODUCT_REVIEW_STATS_SUCCESS = "GET_PRODUCT_REVIEW_STATS_SUCCESS";
export const GET_PRODUCT_REVIEW_STATS_FAILURE = "GET_PRODUCT_REVIEW_STATS_FAILURE";

export const CREATE_REVIEW_REQUEST = "CREATE_REVIEW_REQUEST";
export const CREATE_REVIEW_SUCCESS = "CREATE_REVIEW_SUCCESS";
export const CREATE_REVIEW_FAILURE = "CREATE_REVIEW_FAILURE";

export const UPDATE_REVIEW_REQUEST = "UPDATE_REVIEW_REQUEST";
export const UPDATE_REVIEW_SUCCESS = "UPDATE_REVIEW_SUCCESS";
export const UPDATE_REVIEW_FAILURE = "UPDATE_REVIEW_FAILURE";

export const DELETE_REVIEW_REQUEST = "DELETE_REVIEW_REQUEST";
export const DELETE_REVIEW_SUCCESS = "DELETE_REVIEW_SUCCESS";
export const DELETE_REVIEW_FAILURE = "DELETE_REVIEW_FAILURE";

export const CLEAR_REVIEW_MESSAGES = "CLEAR_REVIEW_MESSAGES";

// Admin
export const getAdminReviewsRequest = (params = {}) => ({
  type: GET_ADMIN_REVIEWS_REQUEST,
  payload: params,
});

export const getAdminReviewsSuccess = (data) => ({
  type: GET_ADMIN_REVIEWS_SUCCESS,
  payload: data,
});

export const getAdminReviewsFailure = (error) => ({
  type: GET_ADMIN_REVIEWS_FAILURE,
  payload: error,
});

export const updateReviewVisibilityRequest = (id, status) => ({
  type: UPDATE_REVIEW_VISIBILITY_REQUEST,
  payload: { id, status },
});

export const updateReviewVisibilitySuccess = (data) => ({
  type: UPDATE_REVIEW_VISIBILITY_SUCCESS,
  payload: data,
});

export const updateReviewVisibilityFailure = (error) => ({
  type: UPDATE_REVIEW_VISIBILITY_FAILURE,
  payload: error,
});

// Public product reviews
export const getProductReviewsRequest = (productId, params = {}) => ({
  type: GET_PRODUCT_REVIEWS_REQUEST,
  payload: { productId, params },
});

export const getProductReviewsSuccess = (data) => ({
  type: GET_PRODUCT_REVIEWS_SUCCESS,
  payload: data,
});

export const getProductReviewsFailure = (error) => ({
  type: GET_PRODUCT_REVIEWS_FAILURE,
  payload: error,
});

export const getProductReviewStatsRequest = (productId) => ({
  type: GET_PRODUCT_REVIEW_STATS_REQUEST,
  payload: productId,
});

export const getProductReviewStatsSuccess = (data) => ({
  type: GET_PRODUCT_REVIEW_STATS_SUCCESS,
  payload: data,
});

export const getProductReviewStatsFailure = (error) => ({
  type: GET_PRODUCT_REVIEW_STATS_FAILURE,
  payload: error,
});

// Customer create/update/delete review
export const createReviewRequest = (data) => ({
  type: CREATE_REVIEW_REQUEST,
  payload: data,
});

export const createReviewSuccess = (data) => ({
  type: CREATE_REVIEW_SUCCESS,
  payload: data,
});

export const createReviewFailure = (error) => ({
  type: CREATE_REVIEW_FAILURE,
  payload: error,
});

export const updateReviewRequest = (id, data) => ({
  type: UPDATE_REVIEW_REQUEST,
  payload: { id, data },
});

export const updateReviewSuccess = (data) => ({
  type: UPDATE_REVIEW_SUCCESS,
  payload: data,
});

export const updateReviewFailure = (error) => ({
  type: UPDATE_REVIEW_FAILURE,
  payload: error,
});

export const deleteReviewRequest = (id) => ({
  type: DELETE_REVIEW_REQUEST,
  payload: id,
});

export const deleteReviewSuccess = (id) => ({
  type: DELETE_REVIEW_SUCCESS,
  payload: id,
});

export const deleteReviewFailure = (error) => ({
  type: DELETE_REVIEW_FAILURE,
  payload: error,
});

export const clearReviewMessages = () => ({
  type: CLEAR_REVIEW_MESSAGES,
});
