import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  CREATE_RECEIPT_REQUEST,
  createReceiptSuccess,
  createReceiptFailure,
  GET_RECEIPT_HISTORY_REQUEST,
  getReceiptHistorySuccess,
  getReceiptHistoryFailure,
  GET_RECEIPT_BY_ID_REQUEST,
  getReceiptByIdSuccess,
  getReceiptByIdFailure,
} from "../actions/inventoryActions";
import { GET_PRODUCTS_REQUEST } from "../actions/productActions";

// ===== INVENTORY TRANSACTION API CALLS =====
const apiCreateReceipt = async (formData) => {
  const response = await apiClient.post("/inventory/receipts", formData);
  return response.data;
};

const apiGetReceiptHistory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.productId) queryParams.append("productId", params.productId);
  if (params.search) queryParams.append("search", params.search);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  const url = `/inventory/receipts${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiGetReceiptById = async (receiptId) => {
  const response = await apiClient.get(`/inventory/receipts/${receiptId}`);
  return response.data;
};

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
      // Backend trả về status "ERR" với message cụ thể
      const errorMessage = response.message || "Không thể nhập kho";
      yield put(createReceiptFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    // Xử lý HTTP errors (400, 500, etc.)
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể nhập kho";
    yield put(createReceiptFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getReceiptHistorySaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetReceiptHistory, params);
    if (response.status === "OK") {
      yield put(
        getReceiptHistorySuccess({
          data: response.data,
          pagination: response.pagination,
        })
      );
    } else {
      throw new Error(response.message || "Không thể tải lịch sử nhập hàng");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải lịch sử nhập hàng";
    yield put(getReceiptHistoryFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getReceiptByIdSaga(action) {
  try {
    const receiptId = action.payload;
    const response = yield call(apiGetReceiptById, receiptId);
    if (response.status === "OK") {
      yield put(getReceiptByIdSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải chi tiết phiếu nhập hàng");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải chi tiết phiếu nhập hàng";
    yield put(getReceiptByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== ROOT SAGA =====
export default function* inventorySaga() {
  yield takeLatest(CREATE_RECEIPT_REQUEST, createReceiptSaga);
  yield takeLatest(GET_RECEIPT_HISTORY_REQUEST, getReceiptHistorySaga);
  yield takeLatest(GET_RECEIPT_BY_ID_REQUEST, getReceiptByIdSaga);
}
