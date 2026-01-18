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
  GET_PENDING_RESET_PRODUCTS_REQUEST,
  getPendingResetProductsSuccess,
  getPendingResetProductsFailure,
  CONFIRM_RESET_PRODUCT_REQUEST,
  confirmResetProductSuccess,
  confirmResetProductFailure,
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

const apiGetPendingResetProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.resetReason) queryParams.append("resetReason", params.resetReason);

  const queryString = queryParams.toString();
  const url = `/admin/products/batch/pending-reset${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiConfirmResetProduct = async (productId) => {
  const response = await apiClient.post(`/admin/products/${productId}/confirm-reset`);
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

function* getPendingResetProductsSaga(action) {
  try {
    const params = action.payload;
    const response = yield call(apiGetPendingResetProducts, params);
    if (response.status === "OK") {
      yield put(
        getPendingResetProductsSuccess({
          data: response.data,
          pagination: response.pagination,
        })
      );
    } else {
      throw new Error(response.message || "Không thể tải danh sách sản phẩm cần reset");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách sản phẩm cần reset";
    yield put(getPendingResetProductsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* confirmResetProductSaga(action) {
  try {
    const productId = action.payload;
    const response = yield call(apiConfirmResetProduct, productId);
    if (response.status === "OK") {
      yield put(confirmResetProductSuccess(response.data));
      toast.success(response.message || "Xác nhận reset thành công");
      // Note: Reload will be handled by the component's useEffect
    } else {
      throw new Error(response.message || "Không thể xác nhận reset");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xác nhận reset";
    yield put(confirmResetProductFailure(errorMessage));
    toast.error(errorMessage);
    // Still clear confirming state on error
    yield put(confirmResetProductSuccess(null));
  }
}

// ===== WATCHERS =====
export function* productBatchSaga() {
  yield takeLatest(GET_PRODUCT_BATCH_HISTORY_REQUEST, getProductBatchHistorySaga);
  yield takeLatest(RESET_PRODUCT_BATCH_REQUEST, resetProductBatchSaga);
  yield takeLatest(GET_PENDING_RESET_PRODUCTS_REQUEST, getPendingResetProductsSaga);
  yield takeLatest(CONFIRM_RESET_PRODUCT_REQUEST, confirmResetProductSaga);
}
