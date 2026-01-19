import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_CATEGORIES_REQUEST,
  getCategoriesSuccess,
  getCategoriesFailure,
  GET_CATEGORY_BY_ID_REQUEST,
  getCategoryByIdSuccess,
  getCategoryByIdFailure,
  CREATE_CATEGORY_REQUEST,
  createCategorySuccess,
  createCategoryFailure,
  UPDATE_CATEGORY_REQUEST,
  updateCategorySuccess,
  updateCategoryFailure,
  DELETE_CATEGORY_REQUEST,
  deleteCategorySuccess,
  deleteCategoryFailure,
  GET_CATEGORY_STATS_REQUEST,
  getCategoryStatsSuccess,
  getCategoryStatsFailure,
} from "../actions/categoryActions";

// ===== CATEGORY API CALLS =====
const apiGetCategories = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.status !== undefined) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await apiClient.get(`/admin/categories?${queryParams.toString()}`);
  return response.data;
};

const apiGetCategoryStats = async () => {
  const response = await apiClient.get("/admin/categories/stats");
  return response.data;
};

const apiGetCategoryById = async (id) => {
  const response = await apiClient.get(`/admin/categories/${id}`);
  return response.data;
};

const apiCreateCategory = async (formData) => {
  const response = await apiClient.post("/admin/categories", formData);
  return response.data;
};

const apiUpdateCategory = async (id, formData) => {
  const response = await apiClient.put(`/admin/categories/${id}`, formData);
  return response.data;
};

const apiDeleteCategory = async (id) => {
  const response = await apiClient.delete(`/admin/categories/${id}`);
  return response.data;
};

// ===== CATEGORY SAGAS =====
function* getCategoriesSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetCategories, params);
    if (response.status === "OK") {
      yield put(getCategoriesSuccess(response));
    } else {
      throw new Error(response.message || "Không thể tải danh sách danh mục");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách danh mục";
    yield put(getCategoriesFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getCategoryByIdSaga(action) {
  try {
    const id = action.payload;
    const response = yield call(apiGetCategoryById, id);
    if (response.status === "OK") {
      yield put(getCategoryByIdSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải danh mục");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh mục";
    yield put(getCategoryByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* createCategorySaga(action) {
  try {
    const formData = action.payload;
    const response = yield call(apiCreateCategory, formData);
    if (response.status === "OK") {
      yield put(createCategorySuccess(response.data));
      toast.success(response.message || "Tạo danh mục thành công");
      // Refresh categories list
      yield put({ type: GET_CATEGORIES_REQUEST });
    } else {
      throw new Error(response.message || "Không thể tạo danh mục");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tạo danh mục";
    yield put(createCategoryFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateCategorySaga(action) {
  try {
    const { id, formData } = action.payload;
    const response = yield call(apiUpdateCategory, id, formData);
    if (response.status === "OK") {
      yield put(updateCategorySuccess(response.data));
      toast.success(response.message || "Cập nhật danh mục thành công");
    } else {
      throw new Error(response.message || "Không thể cập nhật danh mục");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật danh mục";
    yield put(updateCategoryFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* deleteCategorySaga(action) {
  try {
    const id = action.payload;
    const response = yield call(apiDeleteCategory, id);
    if (response.status === "OK") {
      yield put(deleteCategorySuccess(response.message));
      toast.success(response.message || "Xóa danh mục thành công");
      // Refresh categories list
      yield put({ type: GET_CATEGORIES_REQUEST });
    } else {
      // Backend trả về status "ERR" với message cụ thể
      const errorMessage = response.message || "Không thể xóa danh mục";
      yield put(deleteCategoryFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    // Xử lý HTTP errors (400, 500, etc.)
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa danh mục";
    yield put(deleteCategoryFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getCategoryStatsSaga() {
  try {
    const response = yield call(apiGetCategoryStats);
    if (response.status === "OK") {
      yield put(getCategoryStatsSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải thống kê danh mục");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải thống kê danh mục";
    yield put(getCategoryStatsFailure(errorMessage));
  }
}

// ===== ROOT SAGA =====
export default function* categorySaga() {
  yield takeLatest(GET_CATEGORIES_REQUEST, getCategoriesSaga);
  yield takeLatest(GET_CATEGORY_BY_ID_REQUEST, getCategoryByIdSaga);
  yield takeLatest(CREATE_CATEGORY_REQUEST, createCategorySaga);
  yield takeLatest(UPDATE_CATEGORY_REQUEST, updateCategorySaga);
  yield takeLatest(DELETE_CATEGORY_REQUEST, deleteCategorySaga);
  yield takeLatest(GET_CATEGORY_STATS_REQUEST, getCategoryStatsSaga);
}
