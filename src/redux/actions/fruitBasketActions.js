// ===== FRUIT BASKET ACTIONS =====
export const GET_FRUIT_BASKETS_REQUEST = "GET_FRUIT_BASKETS_REQUEST";
export const GET_FRUIT_BASKETS_SUCCESS = "GET_FRUIT_BASKETS_SUCCESS";
export const GET_FRUIT_BASKETS_FAILURE = "GET_FRUIT_BASKETS_FAILURE";

export const GET_FRUIT_BASKET_BY_ID_REQUEST = "GET_FRUIT_BASKET_BY_ID_REQUEST";
export const GET_FRUIT_BASKET_BY_ID_SUCCESS = "GET_FRUIT_BASKET_BY_ID_SUCCESS";
export const GET_FRUIT_BASKET_BY_ID_FAILURE = "GET_FRUIT_BASKET_BY_ID_FAILURE";

export const CREATE_FRUIT_BASKET_REQUEST = "CREATE_FRUIT_BASKET_REQUEST";
export const CREATE_FRUIT_BASKET_SUCCESS = "CREATE_FRUIT_BASKET_SUCCESS";
export const CREATE_FRUIT_BASKET_FAILURE = "CREATE_FRUIT_BASKET_FAILURE";

export const UPDATE_FRUIT_BASKET_REQUEST = "UPDATE_FRUIT_BASKET_REQUEST";
export const UPDATE_FRUIT_BASKET_SUCCESS = "UPDATE_FRUIT_BASKET_SUCCESS";
export const UPDATE_FRUIT_BASKET_FAILURE = "UPDATE_FRUIT_BASKET_FAILURE";

export const DELETE_FRUIT_BASKET_REQUEST = "DELETE_FRUIT_BASKET_REQUEST";
export const DELETE_FRUIT_BASKET_SUCCESS = "DELETE_FRUIT_BASKET_SUCCESS";
export const DELETE_FRUIT_BASKET_FAILURE = "DELETE_FRUIT_BASKET_FAILURE";

export const CLEAR_FRUIT_BASKET_MESSAGES = "CLEAR_FRUIT_BASKET_MESSAGES";

// ===== FRUIT BASKET ACTION CREATORS =====
export const getFruitBasketsRequest = (params = {}) => ({
  type: GET_FRUIT_BASKETS_REQUEST,
  payload: params,
});

export const getFruitBasketsSuccess = (data) => ({
  type: GET_FRUIT_BASKETS_SUCCESS,
  payload: data,
});

export const getFruitBasketsFailure = (error) => ({
  type: GET_FRUIT_BASKETS_FAILURE,
  payload: error,
});

export const getFruitBasketByIdRequest = (id) => ({
  type: GET_FRUIT_BASKET_BY_ID_REQUEST,
  payload: id,
});

export const getFruitBasketByIdSuccess = (data) => ({
  type: GET_FRUIT_BASKET_BY_ID_SUCCESS,
  payload: data,
});

export const getFruitBasketByIdFailure = (error) => ({
  type: GET_FRUIT_BASKET_BY_ID_FAILURE,
  payload: error,
});

export const createFruitBasketRequest = (formData) => ({
  type: CREATE_FRUIT_BASKET_REQUEST,
  payload: formData,
});

export const createFruitBasketSuccess = (data) => ({
  type: CREATE_FRUIT_BASKET_SUCCESS,
  payload: data,
});

export const createFruitBasketFailure = (error) => ({
  type: CREATE_FRUIT_BASKET_FAILURE,
  payload: error,
});

export const updateFruitBasketRequest = (id, formData) => ({
  type: UPDATE_FRUIT_BASKET_REQUEST,
  payload: { id, formData },
});

export const updateFruitBasketSuccess = (data) => ({
  type: UPDATE_FRUIT_BASKET_SUCCESS,
  payload: data,
});

export const updateFruitBasketFailure = (error) => ({
  type: UPDATE_FRUIT_BASKET_FAILURE,
  payload: error,
});

export const deleteFruitBasketRequest = (id) => ({
  type: DELETE_FRUIT_BASKET_REQUEST,
  payload: id,
});

export const deleteFruitBasketSuccess = (message) => ({
  type: DELETE_FRUIT_BASKET_SUCCESS,
  payload: message,
});

export const deleteFruitBasketFailure = (error) => ({
  type: DELETE_FRUIT_BASKET_FAILURE,
  payload: error,
});

export const clearFruitBasketMessages = () => ({
  type: CLEAR_FRUIT_BASKET_MESSAGES,
});
