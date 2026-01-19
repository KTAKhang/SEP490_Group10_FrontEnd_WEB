import {
  ADD_FAVORITE_REQUEST,
  ADD_FAVORITE_SUCCESS,
  ADD_FAVORITE_FAILURE,
  REMOVE_FAVORITE_REQUEST,
  REMOVE_FAVORITE_SUCCESS,
  REMOVE_FAVORITE_FAILURE,
  CHECK_FAVORITE_REQUEST,
  CHECK_FAVORITE_SUCCESS,
  CHECK_FAVORITE_FAILURE,
  GET_FAVORITES_REQUEST,
  GET_FAVORITES_SUCCESS,
  GET_FAVORITES_FAILURE,
} from "../actions/favoriteActions";

const initialState = {
  favorites: [],
  favoritesPagination: null,
  favoritesLoading: false,
  favoritesError: null,
  favoriteStatus: {}, // { productId: boolean } để lưu trạng thái yêu thích của từng sản phẩm
  addFavoriteLoading: false,
  addFavoriteError: null,
  removeFavoriteLoading: false,
  removeFavoriteError: null,
};

const favoriteReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== ADD FAVORITE =====
    case ADD_FAVORITE_REQUEST:
      return {
        ...state,
        addFavoriteLoading: true,
        addFavoriteError: null,
      };
    case ADD_FAVORITE_SUCCESS:
      return {
        ...state,
        addFavoriteLoading: false,
        addFavoriteError: null,
        favoriteStatus: {
          ...state.favoriteStatus,
          [action.payload.product_id]: true,
        },
      };
    case ADD_FAVORITE_FAILURE:
      return {
        ...state,
        addFavoriteLoading: false,
        addFavoriteError: action.payload,
      };

    // ===== REMOVE FAVORITE =====
    case REMOVE_FAVORITE_REQUEST:
      return {
        ...state,
        removeFavoriteLoading: true,
        removeFavoriteError: null,
      };
    case REMOVE_FAVORITE_SUCCESS:
      return {
        ...state,
        removeFavoriteLoading: false,
        removeFavoriteError: null,
        favoriteStatus: {
          ...state.favoriteStatus,
          [action.payload]: false,
        },
        // Xóa sản phẩm khỏi danh sách favorites
        favorites: state.favorites.filter((fav) => fav._id !== action.payload),
      };
    case REMOVE_FAVORITE_FAILURE:
      return {
        ...state,
        removeFavoriteLoading: false,
        removeFavoriteError: action.payload,
      };

    // ===== CHECK FAVORITE =====
    case CHECK_FAVORITE_REQUEST:
      return {
        ...state,
      };
    case CHECK_FAVORITE_SUCCESS:
      return {
        ...state,
        favoriteStatus: {
          ...state.favoriteStatus,
          [action.payload.productId]: action.payload.isFavorite,
        },
      };
    case CHECK_FAVORITE_FAILURE:
      return {
        ...state,
      };

    // ===== GET FAVORITES =====
    case GET_FAVORITES_REQUEST:
      return {
        ...state,
        favoritesLoading: true,
        favoritesError: null,
      };
    case GET_FAVORITES_SUCCESS:
      return {
        ...state,
        favoritesLoading: false,
        favorites: action.payload.data || [],
        favoritesPagination: action.payload.pagination || null,
        favoritesError: null,
        // Cập nhật favoriteStatus cho tất cả sản phẩm trong danh sách
        favoriteStatus: {
          ...state.favoriteStatus,
          ...(action.payload.data || []).reduce((acc, product) => {
            acc[product._id] = true;
            return acc;
          }, {}),
        },
      };
    case GET_FAVORITES_FAILURE:
      return {
        ...state,
        favoritesLoading: false,
        favoritesError: action.payload,
      };

    default:
      return state;
  }
};

export default favoriteReducer;
