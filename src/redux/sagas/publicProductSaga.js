import { call, put, takeLatest } from "redux-saga/effects";
import {
  GET_FEATURED_PRODUCTS_REQUEST,
  getFeaturedProductsSuccess,
  getFeaturedProductsFailure,
  GET_PUBLIC_PRODUCTS_REQUEST,
  getPublicProductsSuccess,
  getPublicProductsFailure,
  GET_PUBLIC_PRODUCT_BY_ID_REQUEST,
  getPublicProductByIdSuccess,
  getPublicProductByIdFailure,
} from "../actions/publicProductActions";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

// API call for featured products (public, no auth required)
const apiGetFeaturedProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products/featured`, {
    withCredentials: false,
  });
  return response.data;
};

// API call for public products list
const apiGetPublicProducts = async (params) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.category) queryParams.append("category", params.category);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await axios.get(
    `${API_BASE_URL}/products?${queryParams.toString()}`,
    {
      withCredentials: false,
    }
  );
  return response.data;
};

// API call for public product detail
const apiGetPublicProductById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
    withCredentials: false,
  });
  return response.data;
};

// Saga for featured products
function* getFeaturedProductsSaga() {
  try {
    const response = yield call(apiGetFeaturedProducts);
    if (response.status === "OK") {
      yield put(getFeaturedProductsSuccess(response.data || []));
    } else {
      yield put(getFeaturedProductsFailure(response.message || "Failed to fetch featured products"));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch featured products";
    yield put(getFeaturedProductsFailure(errorMessage));
  }
}

// Saga for public products list
function* getPublicProductsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetPublicProducts, params);
    if (response.status === "OK") {
      yield put(
        getPublicProductsSuccess({
          data: response.data || [],
          pagination: response.pagination || null,
        })
      );
    } else {
      yield put(getPublicProductsFailure(response.message || "Failed to fetch products"));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch products";
    yield put(getPublicProductsFailure(errorMessage));
  }
}

// Saga for public product detail
function* getPublicProductByIdSaga(action) {
  try {
    const productId = action.payload;
    const response = yield call(apiGetPublicProductById, productId);
    if (response.status === "OK") {
      yield put(getPublicProductByIdSuccess(response.data));
    } else {
      yield put(getPublicProductByIdFailure(response.message || "Failed to fetch product detail"));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch product detail";
    yield put(getPublicProductByIdFailure(errorMessage));
  }
}

export default function* publicProductSaga() {
  yield takeLatest(GET_FEATURED_PRODUCTS_REQUEST, getFeaturedProductsSaga);
  yield takeLatest(GET_PUBLIC_PRODUCTS_REQUEST, getPublicProductsSaga);
  yield takeLatest(GET_PUBLIC_PRODUCT_BY_ID_REQUEST, getPublicProductByIdSaga);
}
