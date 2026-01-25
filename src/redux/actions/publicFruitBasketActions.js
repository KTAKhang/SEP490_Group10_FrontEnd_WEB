// Public Fruit Basket Actions (no authentication required)

export const GET_PUBLIC_FRUIT_BASKETS_REQUEST = "GET_PUBLIC_FRUIT_BASKETS_REQUEST";
export const GET_PUBLIC_FRUIT_BASKETS_SUCCESS = "GET_PUBLIC_FRUIT_BASKETS_SUCCESS";
export const GET_PUBLIC_FRUIT_BASKETS_FAILURE = "GET_PUBLIC_FRUIT_BASKETS_FAILURE";

export const GET_PUBLIC_FRUIT_BASKET_BY_ID_REQUEST = "GET_PUBLIC_FRUIT_BASKET_BY_ID_REQUEST";
export const GET_PUBLIC_FRUIT_BASKET_BY_ID_SUCCESS = "GET_PUBLIC_FRUIT_BASKET_BY_ID_SUCCESS";
export const GET_PUBLIC_FRUIT_BASKET_BY_ID_FAILURE = "GET_PUBLIC_FRUIT_BASKET_BY_ID_FAILURE";

export const CLEAR_PUBLIC_FRUIT_BASKET_MESSAGES = "CLEAR_PUBLIC_FRUIT_BASKET_MESSAGES";

// Action creators
export const getPublicFruitBasketsRequest = (params) => ({
  type: GET_PUBLIC_FRUIT_BASKETS_REQUEST,
  payload: params,
});

export const getPublicFruitBasketsSuccess = (data) => ({
  type: GET_PUBLIC_FRUIT_BASKETS_SUCCESS,
  payload: data,
});

export const getPublicFruitBasketsFailure = (error) => ({
  type: GET_PUBLIC_FRUIT_BASKETS_FAILURE,
  payload: error,
});

export const getPublicFruitBasketByIdRequest = (id) => ({
  type: GET_PUBLIC_FRUIT_BASKET_BY_ID_REQUEST,
  payload: id,
});

export const getPublicFruitBasketByIdSuccess = (data) => ({
  type: GET_PUBLIC_FRUIT_BASKET_BY_ID_SUCCESS,
  payload: data,
});

export const getPublicFruitBasketByIdFailure = (error) => ({
  type: GET_PUBLIC_FRUIT_BASKET_BY_ID_FAILURE,
  payload: error,
});

export const clearPublicFruitBasketMessages = () => ({
  type: CLEAR_PUBLIC_FRUIT_BASKET_MESSAGES,
});
