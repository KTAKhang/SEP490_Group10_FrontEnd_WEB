// ===== FAVORITE ACTIONS =====
export const ADD_FAVORITE_REQUEST = "ADD_FAVORITE_REQUEST";
export const ADD_FAVORITE_SUCCESS = "ADD_FAVORITE_SUCCESS";
export const ADD_FAVORITE_FAILURE = "ADD_FAVORITE_FAILURE";

export const REMOVE_FAVORITE_REQUEST = "REMOVE_FAVORITE_REQUEST";
export const REMOVE_FAVORITE_SUCCESS = "REMOVE_FAVORITE_SUCCESS";
export const REMOVE_FAVORITE_FAILURE = "REMOVE_FAVORITE_FAILURE";

export const CHECK_FAVORITE_REQUEST = "CHECK_FAVORITE_REQUEST";
export const CHECK_FAVORITE_SUCCESS = "CHECK_FAVORITE_SUCCESS";
export const CHECK_FAVORITE_FAILURE = "CHECK_FAVORITE_FAILURE";

export const GET_FAVORITES_REQUEST = "GET_FAVORITES_REQUEST";
export const GET_FAVORITES_SUCCESS = "GET_FAVORITES_SUCCESS";
export const GET_FAVORITES_FAILURE = "GET_FAVORITES_FAILURE";

// ===== ACTION CREATORS =====
export const addFavoriteRequest = (productId) => ({
  type: ADD_FAVORITE_REQUEST,
  payload: productId,
});

export const addFavoriteSuccess = (data) => ({
  type: ADD_FAVORITE_SUCCESS,
  payload: data,
});

export const addFavoriteFailure = (error) => ({
  type: ADD_FAVORITE_FAILURE,
  payload: error,
});

export const removeFavoriteRequest = (productId) => ({
  type: REMOVE_FAVORITE_REQUEST,
  payload: productId,
});

export const removeFavoriteSuccess = (productId) => ({
  type: REMOVE_FAVORITE_SUCCESS,
  payload: productId,
});

export const removeFavoriteFailure = (error) => ({
  type: REMOVE_FAVORITE_FAILURE,
  payload: error,
});

export const checkFavoriteRequest = (productId) => ({
  type: CHECK_FAVORITE_REQUEST,
  payload: productId,
});

export const checkFavoriteSuccess = (productId, isFavorite) => ({
  type: CHECK_FAVORITE_SUCCESS,
  payload: { productId, isFavorite },
});

export const checkFavoriteFailure = (error) => ({
  type: CHECK_FAVORITE_FAILURE,
  payload: error,
});

export const getFavoritesRequest = (params = {}) => ({
  type: GET_FAVORITES_REQUEST,
  payload: params,
});

export const getFavoritesSuccess = (data) => ({
  type: GET_FAVORITES_SUCCESS,
  payload: data,
});

export const getFavoritesFailure = (error) => ({
  type: GET_FAVORITES_FAILURE,
  payload: error,
});
