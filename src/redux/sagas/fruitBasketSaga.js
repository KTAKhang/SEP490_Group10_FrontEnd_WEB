import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_FRUIT_BASKETS_REQUEST,
  getFruitBasketsSuccess,
  getFruitBasketsFailure,
  GET_FRUIT_BASKET_BY_ID_REQUEST,
  getFruitBasketByIdSuccess,
  getFruitBasketByIdFailure,
  CREATE_FRUIT_BASKET_REQUEST,
  createFruitBasketSuccess,
  createFruitBasketFailure,
  UPDATE_FRUIT_BASKET_REQUEST,
  updateFruitBasketSuccess,
  updateFruitBasketFailure,
  DELETE_FRUIT_BASKET_REQUEST,
  deleteFruitBasketSuccess,
  deleteFruitBasketFailure,
} from "../actions/fruitBasketActions";

const apiGetFruitBaskets = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.status !== undefined) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await apiClient.get(`/admin/fruit-baskets?${queryParams.toString()}`);
  return response.data;
};

const apiGetFruitBasketById = async (id) => {
  const response = await apiClient.get(`/admin/fruit-baskets/${id}`);
  return response.data;
};

const apiCreateFruitBasket = async (formData) => {
  const response = await apiClient.post("/admin/fruit-baskets", formData);
  return response.data;
};

const apiUpdateFruitBasket = async (id, formData) => {
  const response = await apiClient.put(`/admin/fruit-baskets/${id}`, formData);
  return response.data;
};

const apiDeleteFruitBasket = async (id) => {
  const response = await apiClient.delete(`/admin/fruit-baskets/${id}`);
  return response.data;
};

function* getFruitBasketsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetFruitBaskets, params);
    if (response.status === "OK") {
      yield put(getFruitBasketsSuccess(response));
    } else {
      throw new Error(response.message || "Không thể tải danh sách giỏ trái cây");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách giỏ trái cây";
    yield put(getFruitBasketsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getFruitBasketByIdSaga(action) {
  try {
    const id = action.payload;
    const response = yield call(apiGetFruitBasketById, id);
    if (response.status === "OK") {
      yield put(getFruitBasketByIdSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải giỏ trái cây");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải giỏ trái cây";
    yield put(getFruitBasketByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* createFruitBasketSaga(action) {
  try {
    const formData = action.payload;
    const response = yield call(apiCreateFruitBasket, formData);
    if (response.status === "OK") {
      yield put(createFruitBasketSuccess(response.data));
      yield put({ type: GET_FRUIT_BASKETS_REQUEST });
    } else {
      throw new Error(response.message || "Không thể tạo giỏ trái cây");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tạo giỏ trái cây";
    yield put(createFruitBasketFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateFruitBasketSaga(action) {
  try {
    const { id, formData } = action.payload;
    const response = yield call(apiUpdateFruitBasket, id, formData);
    if (response.status === "OK") {
      yield put(updateFruitBasketSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể cập nhật giỏ trái cây");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật giỏ trái cây";
    yield put(updateFruitBasketFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* deleteFruitBasketSaga(action) {
  try {
    const id = action.payload;
    const response = yield call(apiDeleteFruitBasket, id);
    if (response.status === "OK") {
      yield put(deleteFruitBasketSuccess(response.message));
      yield put({ type: GET_FRUIT_BASKETS_REQUEST });
    } else {
      const errorMessage = response.message || "Không thể xóa giỏ trái cây";
      yield put(deleteFruitBasketFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa giỏ trái cây";
    yield put(deleteFruitBasketFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* fruitBasketSaga() {
  yield takeLatest(GET_FRUIT_BASKETS_REQUEST, getFruitBasketsSaga);
  yield takeLatest(GET_FRUIT_BASKET_BY_ID_REQUEST, getFruitBasketByIdSaga);
  yield takeLatest(CREATE_FRUIT_BASKET_REQUEST, createFruitBasketSaga);
  yield takeLatest(UPDATE_FRUIT_BASKET_REQUEST, updateFruitBasketSaga);
  yield takeLatest(DELETE_FRUIT_BASKET_REQUEST, deleteFruitBasketSaga);
}
