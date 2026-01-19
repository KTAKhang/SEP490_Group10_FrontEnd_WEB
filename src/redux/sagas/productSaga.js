import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_PRODUCTS_REQUEST,
  getProductsSuccess,
  getProductsFailure,
  GET_PRODUCT_BY_ID_REQUEST,
  getProductByIdSuccess,
  getProductByIdFailure,
  CREATE_PRODUCT_REQUEST,
  createProductSuccess,
  createProductFailure,
  UPDATE_PRODUCT_REQUEST,
  updateProductSuccess,
  updateProductFailure,
  DELETE_PRODUCT_REQUEST,
  deleteProductSuccess,
  deleteProductFailure,
  GET_PRODUCT_STATS_REQUEST,
  getProductStatsSuccess,
  getProductStatsFailure,
  UPDATE_PRODUCT_EXPIRY_DATE_REQUEST,
  updateProductExpiryDateSuccess,
  updateProductExpiryDateFailure,
} from "../actions/productActions";

// ===== PRODUCT API CALLS =====
const apiGetProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.category) queryParams.append("category", params.category);
  if (params.status !== undefined) queryParams.append("status", params.status);
  if (params.receivingStatus) queryParams.append("receivingStatus", params.receivingStatus);
  if (params.stockStatus) queryParams.append("stockStatus", params.stockStatus);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await apiClient.get(`/admin/products?${queryParams.toString()}`);
  return response.data;
};

const apiGetProductStats = async () => {
  const response = await apiClient.get("/admin/products/stats");
  return response.data;
};

const apiGetProductById = async (id) => {
  const response = await apiClient.get(`/admin/products/${id}`);
  return response.data;
};

const apiCreateProduct = async (formData) => {
  const response = await apiClient.post("/admin/products", formData);
  return response.data;
};

const apiUpdateProduct = async (id, formData) => {
  const response = await apiClient.put(`/admin/products/${id}`, formData);
  return response.data;
};

const apiDeleteProduct = async (id) => {
  const response = await apiClient.delete(`/admin/products/${id}`);
  return response.data;
};

const apiUpdateProductExpiryDate = async (id, expiryDate) => {
  const response = await apiClient.patch(`/admin/products/${id}/expiry-date`, { expiryDate });
  return response.data;
};

// ===== PRODUCT SAGAS =====
function* getProductsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetProducts, params);
    if (response.status === "OK") {
      yield put(getProductsSuccess(response));
    } else {
      throw new Error(response.message || "Không thể tải danh sách sản phẩm");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách sản phẩm";
    yield put(getProductsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getProductByIdSaga(action) {
  try {
    const id = action.payload;
    const response = yield call(apiGetProductById, id);
    if (response.status === "OK") {
      yield put(getProductByIdSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải sản phẩm");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải sản phẩm";
    yield put(getProductByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* createProductSaga(action) {
  try {
    const formData = action.payload;
    const response = yield call(apiCreateProduct, formData);
    if (response.status === "OK") {
      yield put(createProductSuccess(response.data));
      toast.success(response.message || "Tạo sản phẩm thành công");
      // Refresh products list
      yield put({ type: GET_PRODUCTS_REQUEST });
    } else {
      throw new Error(response.message || "Không thể tạo sản phẩm");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tạo sản phẩm";
    yield put(createProductFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateProductSaga(action) {
  try {
    const { id, formData } = action.payload;
    const response = yield call(apiUpdateProduct, id, formData);
    if (response.status === "OK") {
      yield put(updateProductSuccess(response.data));
      toast.success(response.message || "Cập nhật sản phẩm thành công");
      // Product is updated directly in reducer, no need to refetch
    } else {
      throw new Error(response.message || "Không thể cập nhật sản phẩm");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật sản phẩm";
    yield put(updateProductFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* deleteProductSaga(action) {
  try {
    const id = action.payload;
    const response = yield call(apiDeleteProduct, id);
    if (response.status === "OK") {
      yield put(deleteProductSuccess(response.message));
      toast.success(response.message || "Xóa sản phẩm thành công");
      // Refresh products list
      yield put({ type: GET_PRODUCTS_REQUEST });
    } else {
      throw new Error(response.message || "Không thể xóa sản phẩm");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa sản phẩm";
    yield put(deleteProductFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getProductStatsSaga() {
  try {
    const response = yield call(apiGetProductStats);
    if (response.status === "OK") {
      yield put(getProductStatsSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải thống kê sản phẩm");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải thống kê sản phẩm";
    yield put(getProductStatsFailure(errorMessage));
  }
}

function* updateProductExpiryDateSaga(action) {
  try {
    const { id, expiryDate } = action.payload;
    const response = yield call(apiUpdateProductExpiryDate, id, expiryDate);
    if (response.status === "OK") {
      yield put(updateProductExpiryDateSuccess(response.data));
      toast.success(response.message || "Cập nhật hạn sử dụng thành công");
      // Refresh products list to update expiry date
      yield put({ type: GET_PRODUCTS_REQUEST });
    } else {
      // Backend trả về status "ERR" với message cụ thể
      const errorMessage = response.message || "Không thể cập nhật hạn sử dụng";
      yield put(updateProductExpiryDateFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    // Xử lý HTTP errors (400, 500, etc.)
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật hạn sử dụng";
    yield put(updateProductExpiryDateFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== ROOT SAGA =====
export default function* productSaga() {
  yield takeLatest(GET_PRODUCTS_REQUEST, getProductsSaga);
  yield takeLatest(GET_PRODUCT_BY_ID_REQUEST, getProductByIdSaga);
  yield takeLatest(CREATE_PRODUCT_REQUEST, createProductSaga);
  yield takeLatest(UPDATE_PRODUCT_REQUEST, updateProductSaga);
  yield takeLatest(DELETE_PRODUCT_REQUEST, deleteProductSaga);
  yield takeLatest(GET_PRODUCT_STATS_REQUEST, getProductStatsSaga);
  yield takeLatest(UPDATE_PRODUCT_EXPIRY_DATE_REQUEST, updateProductExpiryDateSaga);
}
