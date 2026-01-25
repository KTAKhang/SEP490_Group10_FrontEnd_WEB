import {
  GET_FRUIT_BASKETS_REQUEST,
  GET_FRUIT_BASKETS_SUCCESS,
  GET_FRUIT_BASKETS_FAILURE,
  GET_FRUIT_BASKET_BY_ID_REQUEST,
  GET_FRUIT_BASKET_BY_ID_SUCCESS,
  GET_FRUIT_BASKET_BY_ID_FAILURE,
  CREATE_FRUIT_BASKET_REQUEST,
  CREATE_FRUIT_BASKET_SUCCESS,
  CREATE_FRUIT_BASKET_FAILURE,
  UPDATE_FRUIT_BASKET_REQUEST,
  UPDATE_FRUIT_BASKET_SUCCESS,
  UPDATE_FRUIT_BASKET_FAILURE,
  DELETE_FRUIT_BASKET_REQUEST,
  DELETE_FRUIT_BASKET_SUCCESS,
  DELETE_FRUIT_BASKET_FAILURE,
  CLEAR_FRUIT_BASKET_MESSAGES,
} from "../actions/fruitBasketActions";

const initialState = {
  fruitBaskets: [],
  fruitBasketsLoading: false,
  fruitBasketsError: null,
  fruitBasketsPagination: null,
  fruitBasketDetail: null,
  fruitBasketDetailLoading: false,
  fruitBasketDetailError: null,
  createFruitBasketLoading: false,
  createFruitBasketError: null,
  updateFruitBasketLoading: false,
  updateFruitBasketError: null,
  deleteFruitBasketLoading: false,
  deleteFruitBasketError: null,
};

const fruitBasketReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FRUIT_BASKETS_REQUEST:
      return {
        ...state,
        fruitBasketsLoading: true,
        fruitBasketsError: null,
      };
    case GET_FRUIT_BASKETS_SUCCESS:
      return {
        ...state,
        fruitBaskets: action.payload.data || [],
        fruitBasketsPagination: action.payload.pagination || null,
        fruitBasketsLoading: false,
        fruitBasketsError: null,
      };
    case GET_FRUIT_BASKETS_FAILURE:
      return {
        ...state,
        fruitBasketsLoading: false,
        fruitBasketsError: action.payload,
      };

    case GET_FRUIT_BASKET_BY_ID_REQUEST:
      return {
        ...state,
        fruitBasketDetailLoading: true,
        fruitBasketDetailError: null,
      };
    case GET_FRUIT_BASKET_BY_ID_SUCCESS:
      return {
        ...state,
        fruitBasketDetail: action.payload,
        fruitBasketDetailLoading: false,
        fruitBasketDetailError: null,
      };
    case GET_FRUIT_BASKET_BY_ID_FAILURE:
      return {
        ...state,
        fruitBasketDetailLoading: false,
        fruitBasketDetailError: action.payload,
      };

    case CREATE_FRUIT_BASKET_REQUEST:
      return {
        ...state,
        createFruitBasketLoading: true,
        createFruitBasketError: null,
      };
    case CREATE_FRUIT_BASKET_SUCCESS:
      return {
        ...state,
        createFruitBasketLoading: false,
        createFruitBasketError: null,
      };
    case CREATE_FRUIT_BASKET_FAILURE:
      return {
        ...state,
        createFruitBasketLoading: false,
        createFruitBasketError: action.payload,
      };

    case UPDATE_FRUIT_BASKET_REQUEST:
      return {
        ...state,
        updateFruitBasketLoading: true,
        updateFruitBasketError: null,
      };
    case UPDATE_FRUIT_BASKET_SUCCESS: {
      const updatedBasket = action.payload;
      const updatedBaskets = state.fruitBaskets.map((basket) =>
        basket._id === updatedBasket._id ? updatedBasket : basket
      );
      return {
        ...state,
        fruitBaskets: updatedBaskets,
        fruitBasketDetail:
          state.fruitBasketDetail?._id === updatedBasket._id
            ? updatedBasket
            : state.fruitBasketDetail,
        updateFruitBasketLoading: false,
        updateFruitBasketError: null,
      };
    }
    case UPDATE_FRUIT_BASKET_FAILURE:
      return {
        ...state,
        updateFruitBasketLoading: false,
        updateFruitBasketError: action.payload,
      };

    case DELETE_FRUIT_BASKET_REQUEST:
      return {
        ...state,
        deleteFruitBasketLoading: true,
        deleteFruitBasketError: null,
      };
    case DELETE_FRUIT_BASKET_SUCCESS:
      return {
        ...state,
        deleteFruitBasketLoading: false,
        deleteFruitBasketError: null,
      };
    case DELETE_FRUIT_BASKET_FAILURE:
      return {
        ...state,
        deleteFruitBasketLoading: false,
        deleteFruitBasketError: action.payload,
      };

    case CLEAR_FRUIT_BASKET_MESSAGES:
      return {
        ...state,
        createFruitBasketError: null,
        updateFruitBasketError: null,
        deleteFruitBasketError: null,
        fruitBasketsError: null,
        fruitBasketDetailError: null,
      };

    default:
      return state;
  }
};

export default fruitBasketReducer;
