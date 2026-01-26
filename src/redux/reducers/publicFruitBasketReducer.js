import {
  GET_PUBLIC_FRUIT_BASKETS_REQUEST,
  GET_PUBLIC_FRUIT_BASKETS_SUCCESS,
  GET_PUBLIC_FRUIT_BASKETS_FAILURE,
  GET_PUBLIC_FRUIT_BASKET_BY_ID_REQUEST,
  GET_PUBLIC_FRUIT_BASKET_BY_ID_SUCCESS,
  GET_PUBLIC_FRUIT_BASKET_BY_ID_FAILURE,
  CLEAR_PUBLIC_FRUIT_BASKET_MESSAGES,
} from "../actions/publicFruitBasketActions";

const initialState = {
  publicFruitBaskets: [],
  publicFruitBasketsPagination: null,
  publicFruitBasketsLoading: false,
  publicFruitBasketsError: null,

  publicFruitBasketDetail: null,
  publicFruitBasketDetailLoading: false,
  publicFruitBasketDetailError: null,
};

const publicFruitBasketReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PUBLIC_FRUIT_BASKETS_REQUEST:
      return {
        ...state,
        publicFruitBasketsLoading: true,
        publicFruitBasketsError: null,
      };
    case GET_PUBLIC_FRUIT_BASKETS_SUCCESS:
      return {
        ...state,
        publicFruitBaskets: action.payload.data || [],
        publicFruitBasketsPagination: action.payload.pagination || null,
        publicFruitBasketsLoading: false,
        publicFruitBasketsError: null,
      };
    case GET_PUBLIC_FRUIT_BASKETS_FAILURE:
      return {
        ...state,
        publicFruitBasketsLoading: false,
        publicFruitBasketsError: action.payload,
      };

    case GET_PUBLIC_FRUIT_BASKET_BY_ID_REQUEST:
      return {
        ...state,
        publicFruitBasketDetailLoading: true,
        publicFruitBasketDetailError: null,
        publicFruitBasketDetail: null,
      };
    case GET_PUBLIC_FRUIT_BASKET_BY_ID_SUCCESS:
      return {
        ...state,
        publicFruitBasketDetail: action.payload,
        publicFruitBasketDetailLoading: false,
        publicFruitBasketDetailError: null,
      };
    case GET_PUBLIC_FRUIT_BASKET_BY_ID_FAILURE:
      return {
        ...state,
        publicFruitBasketDetailLoading: false,
        publicFruitBasketDetailError: action.payload,
      };

    case CLEAR_PUBLIC_FRUIT_BASKET_MESSAGES:
      return {
        ...state,
        publicFruitBasketsError: null,
        publicFruitBasketDetailError: null,
      };

    default:
      return state;
  }
};

export default publicFruitBasketReducer;
