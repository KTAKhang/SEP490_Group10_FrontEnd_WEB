import {
  GET_PUBLIC_CATEGORIES_REQUEST,
  GET_PUBLIC_CATEGORIES_SUCCESS,
  GET_PUBLIC_CATEGORIES_FAILURE,
  CLEAR_PUBLIC_CATEGORY_MESSAGES,
} from "../actions/publicCategoryActions";

const initialState = {
  publicCategories: [],
  publicCategoriesPagination: null,
  publicCategoriesLoading: false,
  publicCategoriesError: null,
};

const publicCategoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PUBLIC_CATEGORIES_REQUEST:
      return {
        ...state,
        publicCategoriesLoading: true,
        publicCategoriesError: null,
      };
    case GET_PUBLIC_CATEGORIES_SUCCESS:
      return {
        ...state,
        publicCategories: action.payload.data || [],
        publicCategoriesPagination: action.payload.pagination || null,
        publicCategoriesLoading: false,
        publicCategoriesError: null,
      };
    case GET_PUBLIC_CATEGORIES_FAILURE:
      return {
        ...state,
        publicCategoriesLoading: false,
        publicCategoriesError: action.payload,
      };
    case CLEAR_PUBLIC_CATEGORY_MESSAGES:
      return {
        ...state,
        publicCategoriesError: null,
      };
    default:
      return state;
  }
};

export default publicCategoryReducer;
