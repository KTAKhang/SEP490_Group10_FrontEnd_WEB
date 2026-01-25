import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  GET_PUBLIC_FRUIT_BASKETS_REQUEST,
  getPublicFruitBasketsSuccess,
  getPublicFruitBasketsFailure,
  GET_PUBLIC_FRUIT_BASKET_BY_ID_REQUEST,
  getPublicFruitBasketByIdSuccess,
  getPublicFruitBasketByIdFailure,
} from "../actions/publicFruitBasketActions";

const API_BASE_URL = "http://localhost:3001";

const apiGetPublicFruitBaskets = async (params) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await axios.get(
    `${API_BASE_URL}/fruit-baskets?${queryParams.toString()}`,
    { withCredentials: false }
  );
  return response.data;
};

const apiGetPublicFruitBasketById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/fruit-baskets/${id}`, {
    withCredentials: false,
  });
  return response.data;
};

function* getPublicFruitBasketsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetPublicFruitBaskets, params);
    if (response.status === "OK") {
      yield put(
        getPublicFruitBasketsSuccess({
          data: response.data || [],
          pagination: response.pagination || null,
        })
      );
    } else {
      yield put(
        getPublicFruitBasketsFailure(response.message || "Failed to fetch fruit baskets")
      );
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch fruit baskets";
    yield put(getPublicFruitBasketsFailure(errorMessage));
  }
}

function* getPublicFruitBasketByIdSaga(action) {
  try {
    const basketId = action.payload;
    const response = yield call(apiGetPublicFruitBasketById, basketId);
    if (response.status === "OK") {
      yield put(getPublicFruitBasketByIdSuccess(response.data));
    } else {
      yield put(
        getPublicFruitBasketByIdFailure(response.message || "Failed to fetch fruit basket")
      );
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch fruit basket";
    yield put(getPublicFruitBasketByIdFailure(errorMessage));
  }
}

export default function* publicFruitBasketSaga() {
  yield takeLatest(GET_PUBLIC_FRUIT_BASKETS_REQUEST, getPublicFruitBasketsSaga);
  yield takeLatest(GET_PUBLIC_FRUIT_BASKET_BY_ID_REQUEST, getPublicFruitBasketByIdSaga);
}
