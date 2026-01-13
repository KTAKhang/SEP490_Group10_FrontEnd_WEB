import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  // Category
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
  // Product
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
  // Inventory
  CREATE_RECEIPT_REQUEST,
  createReceiptSuccess,
  createReceiptFailure,
  // Update Expiry Date
  UPDATE_PRODUCT_EXPIRY_DATE_REQUEST,
  updateProductExpiryDateSuccess,
  updateProductExpiryDateFailure,
} from "../actions/warehouseActions";

// ===== CATEGORY API CALLS =====
const apiGetCategories = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.status !== undefined) queryParams.append("status", params.status);

  const response = await apiClient.get(`/admin/categories?${queryParams.toString()}`);
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

  const response = await apiClient.get(`/admin/products?${queryParams.toString()}`);
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

// ===== INVENTORY TRANSACTION API CALLS =====
const apiCreateReceipt = async (formData) => {
  const response = await apiClient.post("/inventory/receipts", formData);
  return response.data;
};

// ===== UPDATE PRODUCT EXPIRY DATE API CALL =====
const apiUpdateProductExpiryDate = async (id, expiryDate) => {
  const response = await apiClient.patch(`/admin/products/${id}/expiry-date`, { expiryDate });
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
      // Removed: yield put({ type: GET_CATEGORIES_REQUEST });
      // Category will be updated directly in reducer
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
      throw new Error(response.message || "Không thể xóa danh mục");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa danh mục";
    yield put(deleteCategoryFailure(errorMessage));
    toast.error(errorMessage);
  }
}

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

// ===== INVENTORY TRANSACTION SAGAS =====
function* createReceiptSaga(action) {
  try {
    const formData = action.payload;
    const response = yield call(apiCreateReceipt, formData);
    if (response.status === "OK") {
      yield put(createReceiptSuccess(response.data));
      toast.success(response.message || "Nhập kho thành công");
      // Refresh products list to update quantities
      yield put({ type: GET_PRODUCTS_REQUEST });
    } else {
      throw new Error(response.message || "Không thể nhập kho");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể nhập kho";
    yield put(createReceiptFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== UPDATE PRODUCT EXPIRY DATE SAGAS =====
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
      throw new Error(response.message || "Không thể cập nhật hạn sử dụng");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật hạn sử dụng";
    yield put(updateProductExpiryDateFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== ROOT SAGA =====
export default function* warehouseSaga() {
  // Category
  yield takeLatest(GET_CATEGORIES_REQUEST, getCategoriesSaga);
  yield takeLatest(GET_CATEGORY_BY_ID_REQUEST, getCategoryByIdSaga);
  yield takeLatest(CREATE_CATEGORY_REQUEST, createCategorySaga);
  yield takeLatest(UPDATE_CATEGORY_REQUEST, updateCategorySaga);
  yield takeLatest(DELETE_CATEGORY_REQUEST, deleteCategorySaga);
  // Product
  yield takeLatest(GET_PRODUCTS_REQUEST, getProductsSaga);
  yield takeLatest(GET_PRODUCT_BY_ID_REQUEST, getProductByIdSaga);
  yield takeLatest(CREATE_PRODUCT_REQUEST, createProductSaga);
  yield takeLatest(UPDATE_PRODUCT_REQUEST, updateProductSaga);
  yield takeLatest(DELETE_PRODUCT_REQUEST, deleteProductSaga);
  // Inventory
  yield takeLatest(CREATE_RECEIPT_REQUEST, createReceiptSaga);
  // Update Expiry Date
  yield takeLatest(UPDATE_PRODUCT_EXPIRY_DATE_REQUEST, updateProductExpiryDateSaga);
}
