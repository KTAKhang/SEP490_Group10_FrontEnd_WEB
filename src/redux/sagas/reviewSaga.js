import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_ADMIN_REVIEWS_REQUEST,
  getAdminReviewsSuccess,
  getAdminReviewsFailure,
  UPDATE_REVIEW_VISIBILITY_REQUEST,
  updateReviewVisibilitySuccess,
  updateReviewVisibilityFailure,
  GET_PRODUCT_REVIEWS_REQUEST,
  getProductReviewsSuccess,
  getProductReviewsFailure,
  GET_PRODUCT_REVIEW_STATS_REQUEST,
  getProductReviewStatsSuccess,
  getProductReviewStatsFailure,
  CREATE_REVIEW_REQUEST,
  createReviewSuccess,
  createReviewFailure,
  UPDATE_REVIEW_REQUEST,
  updateReviewSuccess,
  updateReviewFailure,
  DELETE_REVIEW_REQUEST,
  deleteReviewSuccess,
  deleteReviewFailure,
} from "../actions/reviewActions";

const apiGetAdminReviews = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.productId) queryParams.append("productId", params.productId);
  if (params.userId) queryParams.append("userId", params.userId);
  if (params.rating !== undefined && params.rating !== null && params.rating !== "") {
    queryParams.append("rating", params.rating);
  }
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  const url = `/admin/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiUpdateReviewVisibility = async (id, status) => {
  const response = await apiClient.put(`/admin/reviews/${id}/visibility`, { status });
  return response.data;
};

const apiGetProductReviews = async (productId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  const url = `/reviews/product/${productId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiGetProductReviewStats = async (productId) => {
  const response = await apiClient.get(`/reviews/product/${productId}/stats`);
  return response.data;
};

const apiCreateReview = async (payload) => {
  const response = await apiClient.post("/reviews", payload);
  return response.data;
};

const apiUpdateReview = async (id, payload) => {
  const response = await apiClient.put(`/reviews/${id}`, payload);
  return response.data;
};

const apiDeleteReview = async (id) => {
  const response = await apiClient.delete(`/reviews/${id}`);
  return response.data;
};

function* getAdminReviewsSaga(action) {
  try {
    const response = yield call(apiGetAdminReviews, action.payload || {});
    if (response.status === "OK") {
      yield put(
        getAdminReviewsSuccess({
          data: response.data || [],
          pagination: response.pagination || null,
        })
      );
    } else {
      throw new Error(response.message || "Không thể tải danh sách review");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách review";
    yield put(getAdminReviewsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateReviewVisibilitySaga(action) {
  try {
    const { id, status } = action.payload;
    const response = yield call(apiUpdateReviewVisibility, id, status);
    if (response.status === "OK") {
      yield put(updateReviewVisibilitySuccess(response.data));
      toast.success(response.message || "Cập nhật trạng thái review thành công");
    } else {
      throw new Error(response.message || "Không thể cập nhật review");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật review";
    yield put(updateReviewVisibilityFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getProductReviewsSaga(action) {
  try {
    const { productId, params } = action.payload;
    const response = yield call(apiGetProductReviews, productId, params || {});
    if (response.status === "OK") {
      yield put(
        getProductReviewsSuccess({
          data: response.data || [],
          pagination: response.pagination || null,
        })
      );
    } else {
      throw new Error(response.message || "Không thể tải đánh giá sản phẩm");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải đánh giá sản phẩm";
    yield put(getProductReviewsFailure(errorMessage));
  }
}

function* getProductReviewStatsSaga(action) {
  try {
    const response = yield call(apiGetProductReviewStats, action.payload);
    if (response.status === "OK") {
      yield put(getProductReviewStatsSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải thống kê đánh giá");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải thống kê đánh giá";
    yield put(getProductReviewStatsFailure(errorMessage));
  }
}

function* createReviewSaga(action) {
  try {
    const response = yield call(apiCreateReview, action.payload);
    if (response.status === "OK") {
      yield put(createReviewSuccess(response.data));
      toast.success(response.message || "Đánh giá sản phẩm thành công");
    } else {
      throw new Error(response.message || "Không thể tạo đánh giá");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tạo đánh giá";
    yield put(createReviewFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateReviewSaga(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(apiUpdateReview, id, data);
    if (response.status === "OK") {
      yield put(updateReviewSuccess(response.data));
      toast.success(response.message || "Cập nhật đánh giá thành công");
    } else {
      throw new Error(response.message || "Không thể cập nhật đánh giá");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật đánh giá";
    yield put(updateReviewFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* deleteReviewSaga(action) {
  try {
    const response = yield call(apiDeleteReview, action.payload);
    if (response.status === "OK") {
      yield put(deleteReviewSuccess(action.payload));
      toast.success(response.message || "Xóa đánh giá thành công");
    } else {
      throw new Error(response.message || "Không thể xóa đánh giá");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa đánh giá";
    yield put(deleteReviewFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* reviewSaga() {
  yield takeLatest(GET_ADMIN_REVIEWS_REQUEST, getAdminReviewsSaga);
  yield takeLatest(UPDATE_REVIEW_VISIBILITY_REQUEST, updateReviewVisibilitySaga);
  yield takeLatest(GET_PRODUCT_REVIEWS_REQUEST, getProductReviewsSaga);
  yield takeLatest(GET_PRODUCT_REVIEW_STATS_REQUEST, getProductReviewStatsSaga);
  yield takeLatest(CREATE_REVIEW_REQUEST, createReviewSaga);
  yield takeLatest(UPDATE_REVIEW_REQUEST, updateReviewSaga);
  yield takeLatest(DELETE_REVIEW_REQUEST, deleteReviewSaga);
}
