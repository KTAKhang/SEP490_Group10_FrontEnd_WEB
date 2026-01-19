/**
 * author: KhoaNDCE170420
 * staffSaga.js
 * Saga to handle staff-related actions
 */
import { takeLatest, call, put, select } from "redux-saga/effects";
import apiClient from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import {
  STAFF_LIST_REQUEST,
  STAFF_LIST_SUCCESS,
  STAFF_LIST_FAILURE,
  STAFF_CREATE_REQUEST,
  STAFF_CREATE_SUCCESS,
  STAFF_CREATE_FAILURE,
  STAFF_UPDATE_STATUS_REQUEST,
  STAFF_UPDATE_STATUS_SUCCESS,
  STAFF_UPDATE_STATUS_FAILURE,
  STAFF_UPDATE_REQUEST,
  STAFF_UPDATE_SUCCESS,
  STAFF_UPDATE_FAILURE,
  STAFF_DETAIL_REQUEST,
  STAFF_DETAIL_SUCCESS,
  STAFF_DETAIL_FAILURE,
} from "../actions/staffActions";

// Get staff list
function* fetchStaffList(action) {
  try {
    // Check token before calling API
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token not found. Please log in again.");
    }

    const params = action.payload || {};
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
    };
    
    // sort and order params
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    
    // status filter params
    if (params.status && params.status !== "all") {
      queryParams.status = params.status;
    }

    let url;
    
    // use search endpoint if keyword exists
    if (params.keyword && params.keyword.trim()) {
      queryParams.keyword = params.keyword.trim();
      url = "/staff/search";
    } 
    // use filter endpoint if role filter exists (and no keyword)
    else if (params.role && params.role !== "all") {
      queryParams.role = params.role;
      url = "/staff/filter";
    } 
    // Default to list endpoint
    else {
      url = "/staff";
    }

    console.log("[Saga] Fetching staff list:", { url, queryParams, fullUrl: `http://localhost:3001${url}` });
    
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
    yield put({ type: STAFF_LIST_SUCCESS, payload });
  } catch (err) {
    console.error("[Saga] Fetch staff list error:", err);
    console.error("[Saga] Error details:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      statusText: err.response?.statusText,
      headers: err.response?.headers,
    });
    
    // Additional handling for specific error statuses
    if (err.response?.status === 401) {
      console.error("[Saga] Unauthorized - Token may be invalid or expired");
    } else if (err.response?.status === 403) {
      console.error("[Saga] Forbidden - User may not have admin role");
    }
    
    yield put({
      type: STAFF_LIST_FAILURE,
      payload: err.response?.data?.message || err.message,
    });
    toast.error(err.response?.data?.message || "Error loading staff list");
  }
}

// Create new staff
function* createStaff(action) {
  try {
    const payload = action.payload;
    let response;
    
    // Check if payload is FormData (has file) or regular object
    if (payload instanceof FormData) {
      // Don't set Content-Type header - axios will set it automatically with boundary
      response = yield call(() =>
        apiClient.post("/staff", payload)
      );
    } else {
      response = yield call(() =>
        apiClient.post("/staff", payload)
      );
    }

    if (response.data?.status === "OK") {
      yield put({ type: STAFF_CREATE_SUCCESS });
      toast.success(response.data.message || "Staff created successfully");

      // Reload list with current params
      const currentParams = yield select((state) => state.staff.params);
      yield put({ type: STAFF_LIST_REQUEST, payload: currentParams });
    } else {
      throw new Error(response.data?.message || "Failed to create staff");
    }
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    yield put({
      type: STAFF_CREATE_FAILURE,
      payload: message,
    });
    toast.error(message);
  }
}

// Update staff status (active/inactive)
function* updateStaffStatus(action) {
  try {
    const { staffId, status } = action.payload;
    const response = yield call(() =>
      apiClient.put(`/staff/status/${staffId}`, { status })
    );

    if (response.data?.status === "OK") {
      yield put({ type: STAFF_UPDATE_STATUS_SUCCESS });
      toast.success(response.data.message || "Staff status updated successfully");

      // Reload list with current params
      const currentParams = yield select((state) => state.staff.params);
      yield put({ type: STAFF_LIST_REQUEST, payload: currentParams });
    } else {
      throw new Error(response.data?.message || "Failed to update staff status");
    }
  } catch (err) {
    console.error("[Saga] Update staff status error:", err);
    const message = err.response?.data?.message || err.message;
    yield put({ type: STAFF_UPDATE_STATUS_FAILURE, payload: message });
    toast.error(message);
  }
}

// Update staff information
function* updateStaff(action) {
  try {
    const { staffId, data } = action.payload;
    let response;
    
    // Check if data is FormData (has file) or regular object
    if (data instanceof FormData) {
      // Don't set Content-Type header - axios will set it automatically with boundary
      response = yield call(() =>
        apiClient.put(`/staff/${staffId}`, data)
      );
    } else {
      response = yield call(() =>
        apiClient.put(`/staff/${staffId}`, data)
      );
    }

    if (response.data?.status === "OK") {
      yield put({ type: STAFF_UPDATE_SUCCESS });
      toast.success(response.data.message || "Staff information updated successfully");

      // Reload list with current params
      const currentParams = yield select((state) => state.staff.params);
      yield put({ type: STAFF_LIST_REQUEST, payload: currentParams });
    } else {
      throw new Error(response.data?.message || "Failed to update staff information");
    }
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    yield put({ type: STAFF_UPDATE_FAILURE, payload: message });
    toast.error(message);
  }
}

// Fetch staff detail
function* fetchStaffDetail(action) {
  try {
    const res = yield call(() =>
      apiClient.get(`/staff/${action.payload}`)
    );
    
    yield put({ type: STAFF_DETAIL_SUCCESS, payload: res.data });
  } catch (err) {
    yield put({
      type: STAFF_DETAIL_FAILURE,
      payload: err.response?.data?.message || err.message,
    });
    toast.error(err.response?.data?.message || "Failed to load staff details");
  }
}

export default function* staffSaga() {
  yield takeLatest(STAFF_LIST_REQUEST, fetchStaffList);
  yield takeLatest(STAFF_CREATE_REQUEST, createStaff);
  yield takeLatest(STAFF_UPDATE_STATUS_REQUEST, updateStaffStatus);
  yield takeLatest(STAFF_UPDATE_REQUEST, updateStaff);
  yield takeLatest(STAFF_DETAIL_REQUEST, fetchStaffDetail);
}
