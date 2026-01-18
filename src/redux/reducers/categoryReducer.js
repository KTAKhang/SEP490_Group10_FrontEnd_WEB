import {
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
  GET_CATEGORY_STATS_REQUEST,
  GET_CATEGORY_STATS_SUCCESS,
  GET_CATEGORY_STATS_FAILURE,
  CLEAR_CATEGORY_MESSAGES,
} from "../actions/categoryActions";

const initialState = {
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
  categoryStats: null,
  categoryStatsLoading: false,
  categoryStatsError: null,
};

const categoryReducer = (state = initialState, action) => {
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

    // ===== GET CATEGORY STATS =====
    case GET_CATEGORY_STATS_REQUEST:
      return {
        ...state,
        categoryStatsLoading: true,
        categoryStatsError: null,
      };
    case GET_CATEGORY_STATS_SUCCESS:
      return {
        ...state,
        categoryStats: action.payload,
        categoryStatsLoading: false,
        categoryStatsError: null,
      };
    case GET_CATEGORY_STATS_FAILURE:
      return {
        ...state,
        categoryStatsLoading: false,
        categoryStatsError: action.payload,
      };

    // ===== CLEAR MESSAGES =====
    case CLEAR_CATEGORY_MESSAGES:
      return {
        ...state,
        createCategoryError: null,
        updateCategoryError: null,
        deleteCategoryError: null,
      };

    default:
      return state;
  }
};

export default categoryReducer;
