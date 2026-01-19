import {
  GET_FEATURED_PRODUCTS_REQUEST,
  GET_FEATURED_PRODUCTS_SUCCESS,
  GET_FEATURED_PRODUCTS_FAILURE,
  GET_PUBLIC_PRODUCTS_REQUEST,
  GET_PUBLIC_PRODUCTS_SUCCESS,
  GET_PUBLIC_PRODUCTS_FAILURE,
  GET_PUBLIC_PRODUCT_BY_ID_REQUEST,
  GET_PUBLIC_PRODUCT_BY_ID_SUCCESS,
  GET_PUBLIC_PRODUCT_BY_ID_FAILURE,
  CLEAR_PUBLIC_PRODUCT_MESSAGES,
} from "../actions/publicProductActions";

const initialState = {
  // Featured products
  featuredProducts: [],
  featuredProductsLoading: false,
  featuredProductsError: null,

  // Public products list
  publicProducts: [],
  publicProductsPagination: null,
  publicProductsLoading: false,
  publicProductsError: null,

  // Public product detail
  publicProductDetail: null,
  publicProductDetailLoading: false,
  publicProductDetailError: null,
};

const publicProductReducer = (state = initialState, action) => {
  switch (action.type) {
    // Featured Products
    case GET_FEATURED_PRODUCTS_REQUEST:
      return {
        ...state,
        featuredProductsLoading: true,
        featuredProductsError: null,
      };
    case GET_FEATURED_PRODUCTS_SUCCESS:
      return {
        ...state,
        featuredProducts: action.payload,
        featuredProductsLoading: false,
        featuredProductsError: null,
      };
    case GET_FEATURED_PRODUCTS_FAILURE:
      return {
        ...state,
        featuredProductsLoading: false,
        featuredProductsError: action.payload,
      };

    // Public Products List
    case GET_PUBLIC_PRODUCTS_REQUEST:
      return {
        ...state,
        publicProductsLoading: true,
        publicProductsError: null,
      };
    case GET_PUBLIC_PRODUCTS_SUCCESS:
      return {
        ...state,
        publicProducts: action.payload.data || [],
        publicProductsPagination: action.payload.pagination || null,
        publicProductsLoading: false,
        publicProductsError: null,
      };
    case GET_PUBLIC_PRODUCTS_FAILURE:
      return {
        ...state,
        publicProductsLoading: false,
        publicProductsError: action.payload,
      };

    // Public Product Detail
    case GET_PUBLIC_PRODUCT_BY_ID_REQUEST:
      return {
        ...state,
        publicProductDetailLoading: true,
        publicProductDetailError: null,
        publicProductDetail: null,
      };
    case GET_PUBLIC_PRODUCT_BY_ID_SUCCESS:
      return {
        ...state,
        publicProductDetail: action.payload,
        publicProductDetailLoading: false,
        publicProductDetailError: null,
      };
    case GET_PUBLIC_PRODUCT_BY_ID_FAILURE:
      return {
        ...state,
        publicProductDetailLoading: false,
        publicProductDetailError: action.payload,
      };

    // Clear messages
    case CLEAR_PUBLIC_PRODUCT_MESSAGES:
      return {
        ...state,
        featuredProductsError: null,
        publicProductsError: null,
        publicProductDetailError: null,
      };

    default:
      return state;
  }
};

export default publicProductReducer;
