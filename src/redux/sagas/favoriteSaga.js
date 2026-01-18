import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  ADD_FAVORITE_REQUEST,
  addFavoriteSuccess,
  addFavoriteFailure,
  REMOVE_FAVORITE_REQUEST,
  removeFavoriteSuccess,
  removeFavoriteFailure,
  CHECK_FAVORITE_REQUEST,
  checkFavoriteSuccess,
  checkFavoriteFailure,
  GET_FAVORITES_REQUEST,
  getFavoritesSuccess,
  getFavoritesFailure,
} from "../actions/favoriteActions";

// ===== API CALLS =====
const apiAddFavorite = async (productId) => {
  const response = await apiClient.post("/favorites", { productId });
  return response.data;
};

const apiRemoveFavorite = async (productId) => {
  const response = await apiClient.delete(`/favorites/${productId}`);
  return response.data;
};

const apiCheckFavorite = async (productId) => {
  const response = await apiClient.get(`/favorites/check/${productId}`);
  return response.data;
};

const apiGetFavorites = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.category) queryParams.append("category", params.category);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = `/favorites${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

// ===== SAGAS =====
function* addFavoriteSaga(action) {
  try {
    const productId = action.payload;
    const response = yield call(apiAddFavorite, productId);
    if (response.status === "OK") {
      yield put(addFavoriteSuccess(response.data));
      toast.success(response.message || "Đã thêm vào danh sách yêu thích");
    } else {
      throw new Error(response.message || "Không thể thêm vào danh sách yêu thích");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể thêm vào danh sách yêu thích";
    yield put(addFavoriteFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* removeFavoriteSaga(action) {
  try {
    const productId = action.payload;
    const response = yield call(apiRemoveFavorite, productId);
    if (response.status === "OK") {
      yield put(removeFavoriteSuccess(productId));
      toast.success(response.message || "Đã xóa khỏi danh sách yêu thích");
    } else {
      throw new Error(response.message || "Không thể xóa khỏi danh sách yêu thích");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa khỏi danh sách yêu thích";
    yield put(removeFavoriteFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* checkFavoriteSaga(action) {
  try {
    const productId = action.payload;
    const response = yield call(apiCheckFavorite, productId);
    if (response.status === "OK") {
      yield put(checkFavoriteSuccess(productId, response.data.isFavorite));
    } else {
      throw new Error(response.message || "Không thể kiểm tra trạng thái yêu thích");
    }
  } catch (error) {
    // Không hiển thị toast error cho check favorite (có thể do chưa đăng nhập)
    yield put(checkFavoriteFailure(error.message));
  }
}

function* getFavoritesSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetFavorites, params);
    if (response.status === "OK") {
      yield put(
        getFavoritesSuccess({
          data: response.data,
          pagination: response.pagination,
        })
      );
    } else {
      throw new Error(response.message || "Không thể tải danh sách yêu thích");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách yêu thích";
    yield put(getFavoritesFailure(errorMessage));
    // Không hiển thị toast error nếu:
    // - Lỗi 401 (chưa đăng nhập) - normal case
    // - Lỗi 500 (server error) - đã có toast trong axios interceptor
    if (error.response?.status !== 401 && error.response?.status !== 500) {
      console.error("Error loading favorites:", errorMessage);
      // Only show toast for non-auth, non-server errors
      if (error.response?.status && error.response.status < 500) {
        toast.error(errorMessage);
      }
    }
  }
}

// ===== ROOT SAGA =====
export default function* favoriteSaga() {
  yield takeLatest(ADD_FAVORITE_REQUEST, addFavoriteSaga);
  yield takeLatest(REMOVE_FAVORITE_REQUEST, removeFavoriteSaga);
  yield takeLatest(CHECK_FAVORITE_REQUEST, checkFavoriteSaga);
  yield takeLatest(GET_FAVORITES_REQUEST, getFavoritesSaga);
}
