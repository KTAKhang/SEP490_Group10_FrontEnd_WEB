import {
  // Category
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAILURE,
  GET_CATEGORY_BY_ID_REQUEST,
  GET_CATEGORY_BY_ID_SUCCESS,
  GET_CATEGORY_BY_ID_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  // Product
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
  // Update Expiry Date
  UPDATE_PRODUCT_EXPIRY_DATE_REQUEST,
  UPDATE_PRODUCT_EXPIRY_DATE_SUCCESS,
  UPDATE_PRODUCT_EXPIRY_DATE_FAILURE,
  // Inventory
  CREATE_RECEIPT_REQUEST,
  CREATE_RECEIPT_SUCCESS,
  CREATE_RECEIPT_FAILURE,
  // Clear
  CLEAR_WAREHOUSE_MESSAGES,
} from "../actions/warehouseActions";

const initialState = {
  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  categoriesPagination: null,
  categoryDetail: null,
  categoryDetailLoading: false,
  categoryDetailError: null,
  createCategoryLoading: false,
  createCategoryError: null,
  updateCategoryLoading: false,
  updateCategoryError: null,
  deleteCategoryLoading: false,
  deleteCategoryError: null,

  // Products
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

  // Inventory
  createReceiptLoading: false,
  createReceiptError: null,
};

const warehouseReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== GET CATEGORIES =====
    case GET_CATEGORIES_REQUEST:
      return {
        ...state,
        categoriesLoading: true,
        categoriesError: null,
      };
    case GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload.data || [],
        categoriesPagination: action.payload.pagination || null,
        categoriesLoading: false,
        categoriesError: null,
      };
    case GET_CATEGORIES_FAILURE:
      return {
        ...state,
        categoriesLoading: false,
        categoriesError: action.payload,
      };

    // ===== GET CATEGORY BY ID =====
    case GET_CATEGORY_BY_ID_REQUEST:
      return {
        ...state,
        categoryDetailLoading: true,
        categoryDetailError: null,
      };
    case GET_CATEGORY_BY_ID_SUCCESS:
      return {
        ...state,
        categoryDetail: action.payload,
        categoryDetailLoading: false,
        categoryDetailError: null,
      };
    case GET_CATEGORY_BY_ID_FAILURE:
      return {
        ...state,
        categoryDetailLoading: false,
        categoryDetailError: action.payload,
      };

    // ===== CREATE CATEGORY =====
    case CREATE_CATEGORY_REQUEST:
      return {
        ...state,
        createCategoryLoading: true,
        createCategoryError: null,
      };
    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        createCategoryLoading: false,
        createCategoryError: null,
      };
    case CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        createCategoryLoading: false,
        createCategoryError: action.payload,
      };

    // ===== UPDATE CATEGORY =====
    case UPDATE_CATEGORY_REQUEST:
      return {
        ...state,
        updateCategoryLoading: true,
        updateCategoryError: null,
      };
    case UPDATE_CATEGORY_SUCCESS:
      // Update category in the list immediately without refetching
      const updatedCategory = action.payload;
      const updatedCategories = state.categories.map((c) =>
        c._id === updatedCategory._id ? updatedCategory : c
      );
      return {
        ...state,
        categories: updatedCategories,
        updateCategoryLoading: false,
        updateCategoryError: null,
      };
    case UPDATE_CATEGORY_FAILURE:
      return {
        ...state,
        updateCategoryLoading: false,
        updateCategoryError: action.payload,
      };

    // ===== DELETE CATEGORY =====
    case DELETE_CATEGORY_REQUEST:
      return {
        ...state,
        deleteCategoryLoading: true,
        deleteCategoryError: null,
      };
    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        deleteCategoryLoading: false,
        deleteCategoryError: null,
      };
    case DELETE_CATEGORY_FAILURE:
      return {
        ...state,
        deleteCategoryLoading: false,
        deleteCategoryError: action.payload,
      };

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

    // ===== CREATE RECEIPT =====
    case CREATE_RECEIPT_REQUEST:
      return {
        ...state,
        createReceiptLoading: true,
        createReceiptError: null,
      };
    case CREATE_RECEIPT_SUCCESS:
      return {
        ...state,
        createReceiptLoading: false,
        createReceiptError: null,
      };
    case CREATE_RECEIPT_FAILURE:
      return {
        ...state,
        createReceiptLoading: false,
        createReceiptError: action.payload,
      };

    // ===== CLEAR MESSAGES =====
    case CLEAR_WAREHOUSE_MESSAGES:
      return {
        ...state,
        createCategoryError: null,
        updateCategoryError: null,
        deleteCategoryError: null,
        createProductError: null,
        updateProductError: null,
        deleteProductError: null,
        createReceiptError: null,
      };

    default:
      return state;
  }
};

export default warehouseReducer;
