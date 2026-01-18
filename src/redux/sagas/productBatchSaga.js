import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_PRODUCT_BATCH_HISTORY_REQUEST,
  getProductBatchHistorySuccess,
  getProductBatchHistoryFailure,
  RESET_PRODUCT_BATCH_REQUEST,
  resetProductBatchSuccess,
  resetProductBatchFailure,
} from "../actions/productBatchActions";

// ===== PRODUCT BATCH API CALLS =====
const apiGetProductBatchHistory = async (productId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const queryString = queryParams.toString();
  const url = `/admin/products/${productId}/batch-history${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiResetProductBatch = async (productId, completionReason) => {
  const response = await apiClient.patch(`/admin/products/${productId}/reset-batch`, {
    completionReason,
  });
  return response.data;
};

// ===== PRODUCT BATCH SAGAS =====
function* getProductBatchHistorySaga(action) {
  try {
    const { productId, params } = action.payload;
    const response = yield call(apiGetProductBatchHistory, productId, params);
    if (response.status === "OK") {
      yield put(
        getProductBatchHistorySuccess({
          data: response.data,
          pagination: response.pagination,
        })
      );
    } else {
      throw new Error(response.message || "Không thể tải lịch sử lô hàng");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải lịch sử lô hàng";
    yield put(getProductBatchHistoryFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* resetProductBatchSaga(action) {
  try {
    const { productId, completionReason } = action.payload;
    const response = yield call(apiResetProductBatch, productId, completionReason);
    if (response.status === "OK") {
      yield put(resetProductBatchSuccess(response.data));
      toast.success(response.message || "Reset lô hàng thành công");
    } else {
      throw new Error(response.message || "Không thể reset lô hàng");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể reset lô hàng";
    yield put(resetProductBatchFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== WATCHERS =====
export function* productBatchSaga() {
  yield takeLatest(GET_PRODUCT_BATCH_HISTORY_REQUEST, getProductBatchHistorySaga);
  yield takeLatest(RESET_PRODUCT_BATCH_REQUEST, resetProductBatchSaga);
}
