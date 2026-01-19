import {
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAILURE,
  GET_PRODUCT_BY_ID_REQUEST,
  GET_PRODUCT_BY_ID_SUCCESS,
  GET_PRODUCT_BY_ID_FAILURE,
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  GET_PRODUCT_STATS_REQUEST,
  GET_PRODUCT_STATS_SUCCESS,
  GET_PRODUCT_STATS_FAILURE,
  UPDATE_PRODUCT_EXPIRY_DATE_REQUEST,
  UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS,
  UPDATE_PRODUCT_EXPIRY_DATE_FAILURE,
  CLEAR_PRODUCT_MESSAGES,
} from "../actions/productActions";

const initialState = {
  products: [],
  productsLoading: false,
  productsError: null,
  productsPagination: null,
  productDetail: null,
  productDetailLoading: false,
  productDetailError: null,
  createProductLoading: false,
  createProductError: null,
  updateProductLoading: false,
  updateProductError: null,
  deleteProductLoading: false,
  deleteProductError: null,
  productStats: null,
  productStatsLoading: false,
  productStatsError: null,
  updateProductExpiryDateLoading: false,
  updateProductExpiryDateError: null,
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== GET PRODUCTS =====
    case GET_PRODUCTS_REQUEST:
      return {
        ...state,
        productsLoading: true,
        productsError: null,
      };
    case GET_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: action.payload.data || [],
        productsPagination: action.payload.pagination || null,
        productsLoading: false,
        productsError: null,
      };
    case GET_PRODUCTS_FAILURE:
      return {
        ...state,
        productsLoading: false,
        productsError: action.payload,
      };

    // ===== GET PRODUCT BY ID =====
    case GET_PRODUCT_BY_ID_REQUEST:
      return {
        ...state,
        productDetailLoading: true,
        productDetailError: null,
      };
    case GET_PRODUCT_BY_ID_SUCCESS:
      return {
        ...state,
        productDetail: action.payload,
        productDetailLoading: false,
        productDetailError: null,
      };
    case GET_PRODUCT_BY_ID_FAILURE:
      return {
        ...state,
        productDetailLoading: false,
        productDetailError: action.payload,
      };

    // ===== CREATE PRODUCT =====
    case CREATE_PRODUCT_REQUEST:
      return {
        ...state,
        createProductLoading: true,
        createProductError: null,
      };
    case CREATE_PRODUCT_SUCCESS:
      return {
        ...state,
        createProductLoading: false,
        createProductError: null,
      };
    case CREATE_PRODUCT_FAILURE:
      return {
        ...state,
        createProductLoading: false,
        createProductError: action.payload,
      };

    // ===== UPDATE PRODUCT =====
    case UPDATE_PRODUCT_REQUEST:
      return {
        ...state,
        updateProductLoading: true,
        updateProductError: null,
      };
    case UPDATE_PRODUCT_SUCCESS:
      // Update product in the list immediately without refetching
      const updatedProduct = action.payload;
      const updatedProducts = state.products.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p
      );
      return {
        ...state,
        products: updatedProducts,
        updateProductLoading: false,
        updateProductError: null,
      };
    case UPDATE_PRODUCT_FAILURE:
      return {
        ...state,
        updateProductLoading: false,
        updateProductError: action.payload,
      };

    // ===== UPDATE PRODUCT EXPIRY DATE =====
    case UPDATE_PRODUCT_EXPIRY_DATE_REQUEST:
      return {
        ...state,
        updateProductExpiryDateLoading: true,
        updateProductExpiryDateError: null,
      };
    case UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS:
      // Update product in the list immediately without refetching
      const updatedProductExpiry = action.payload;
      const updatedProductsExpiry = state.products.map((p) =>
        p._id === updatedProductExpiry._id ? updatedProductExpiry : p
      );
      return {
        ...state,
        products: updatedProductsExpiry,
        updateProductExpiryDateLoading: false,
        updateProductExpiryDateError: null,
      };
    case UPDATE_PRODUCT_EXPIRY_DATE_FAILURE:
      return {
        ...state,
        updateProductExpiryDateLoading: false,
        updateProductExpiryDateError: action.payload,
      };

    // ===== DELETE PRODUCT =====
    case DELETE_PRODUCT_REQUEST:
      return {
        ...state,
        deleteProductLoading: true,
        deleteProductError: null,
      };
    case DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        deleteProductLoading: false,
        deleteProductError: null,
      };
    case DELETE_PRODUCT_FAILURE:
      return {
        ...state,
        deleteProductLoading: false,
        deleteProductError: action.payload,
      };

    // ===== GET PRODUCT STATS =====
    case GET_PRODUCT_STATS_REQUEST:
      return {
        ...state,
        productStatsLoading: true,
        productStatsError: null,
      };
    case GET_PRODUCT_STATS_SUCCESS:
      return {
        ...state,
        productStats: action.payload,
        productStatsLoading: false,
        productStatsError: null,
      };
    case GET_PRODUCT_STATS_FAILURE:
      return {
        ...state,
        productStatsLoading: false,
        productStatsError: action.payload,
      };

    // ===== CLEAR MESSAGES =====
    case CLEAR_PRODUCT_MESSAGES:
      return {
        ...state,
        createProductError: null,
        updateProductError: null,
        deleteProductError: null,
        updateProductExpiryDateError: null,
      };

    default:
      return state;
  }
};

export default productReducer;
