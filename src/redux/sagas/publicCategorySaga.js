import { call, put, takeLatest } from "redux-saga/effects";
import {
  GET_PUBLIC_CATEGORIES_REQUEST,
  getPublicCategoriesSuccess,
  getPublicCategoriesFailure,
} from "../actions/publicCategoryActions";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

// API call for public categories list
const apiGetPublicCategories = async (params) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);

  const response = await axios.get(
    `${API_BASE_URL}/categories?${queryParams.toString()}`,
    {
      withCredentials: false,
    }
  );
  return response.data;
};

// Saga for public categories list
function* getPublicCategoriesSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetPublicCategories, params);
    if (response.status === "OK") {
      yield put(
        getPublicCategoriesSuccess({
          data: response.data || [],
          pagination: response.pagination || null,
        })
      );
    } else {
      yield put(getPublicCategoriesFailure(response.message || "Failed to fetch categories"));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch categories";
    yield put(getPublicCategoriesFailure(errorMessage));
  }
}

export default function* publicCategorySaga() {
  yield takeLatest(GET_PUBLIC_CATEGORIES_REQUEST, getPublicCategoriesSaga);
}
