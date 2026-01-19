/**
 * author: KhoaNDCE170420
 * customerSaga.js
 * Saga to handle customer-related actions
 */
import { takeLatest, call, put, select } from "redux-saga/effects";
import apiClient from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import {
  CUSTOMER_LIST_REQUEST,
  CUSTOMER_LIST_SUCCESS,
  CUSTOMER_LIST_FAILURE,
  CUSTOMER_UPDATE_STATUS_REQUEST,
  CUSTOMER_UPDATE_STATUS_SUCCESS,
  CUSTOMER_UPDATE_STATUS_FAILURE,
  CUSTOMER_DETAIL_REQUEST,
  CUSTOMER_DETAIL_SUCCESS,
  CUSTOMER_DETAIL_FAILURE,
} from "../actions/customerActions";

// get customer list with params: page, limit, sortBy, sortOrder, status, isGoogleAccount, keyword
function* fetchCustomerList(action) {
  try {
    const params = action.payload || {};
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
    };
    
    //sort params
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    
    //status filter
    if (params.status && params.status !== "all") {
      queryParams.status = params.status;
    }

    let url;
    
    //if (keyword exists) use search endpoint
    if (params.keyword && params.keyword.trim()) {
      queryParams.keyword = params.keyword.trim();
      url = "/customers/search";
    } 
    //if (filter exists and no keyword) use filter endpoint
    else if (params.status || params.isGoogleAccount !== undefined) {
      if (params.isGoogleAccount !== undefined) {
        queryParams.isGoogleAccount = params.isGoogleAccount;
      }
      url = "/customers/filter";
    } 
    // Default to list endpoint
    else {
      url = "/customers";
    }

    const res = yield call(() => apiClient.get(url, { params: queryParams }));
    let payload = res.data;

    // Handle response from backend
    if (payload && payload.status === "OK") {
      payload = {
        data: payload.data || [],
        pagination: payload.pagination || { page: 1, limit: 10, total: 0 },
      };
    } else if (Array.isArray(payload)) {
      payload = {
        data: payload,
        pagination: { page: 1, limit: payload.length, total: payload.length },
      };
    } else {
      payload = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
    }

    yield put({ type: CUSTOMER_LIST_SUCCESS, payload });
  } catch (err) {
    console.error("[Saga] Fetch customer list error:", err);
    yield put({
      type: CUSTOMER_LIST_FAILURE,
      payload: err.response?.data?.message || err.message,
    });
    toast.error(err.response?.data?.message || "Error loading customer list");
  }
}

// Update customer status (active/inactive)
function* updateCustomerStatus(action) {
  try {
    const { customerId, status } = action.payload;
    const response = yield call(() =>
      apiClient.patch(`/customers/${customerId}/status`, { status })
    );

    if (response.data?.status === "OK") {
      yield put({ type: CUSTOMER_UPDATE_STATUS_SUCCESS });
      toast.success(response.data.message || "Customer status updated successfully");

      // Reload list with current params
      const currentParams = yield select((state) => state.customer.params);
      yield put({ type: CUSTOMER_LIST_REQUEST, payload: currentParams });
    } else {
      throw new Error(response.data?.message || "Failed to update customer status");
    }
  } catch (err) {
    console.error("[Saga] Update customer status error:", err);
    const message = err.response?.data?.message || err.message;
    yield put({ type: CUSTOMER_UPDATE_STATUS_FAILURE, payload: message });
    toast.error(message);
  }
}

// Get customer detail
function* fetchCustomerDetail(action) {
  try {
    const res = yield call(() =>
      apiClient.get(`/customers/${action.payload}`)
    );
    
    yield put({ type: CUSTOMER_DETAIL_SUCCESS, payload: res.data });
  } catch (err) {
    console.error("[Saga] Fetch customer detail error:", err);
    yield put({
      type: CUSTOMER_DETAIL_FAILURE,
      payload: err.response?.data?.message || err.message,
    });
    toast.error(err.response?.data?.message || "Error loading customer details");
  }
}

export default function* customerSaga() {
  yield takeLatest(CUSTOMER_LIST_REQUEST, fetchCustomerList);
  yield takeLatest(CUSTOMER_UPDATE_STATUS_REQUEST, updateCustomerStatus);
  yield takeLatest(CUSTOMER_DETAIL_REQUEST, fetchCustomerDetail);
}
