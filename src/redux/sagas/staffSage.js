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

// Lấy danh sách staff
function* fetchStaffList(action) {
  try {
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
    }

    const params = action.payload || {};
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
    };
    
    // Thêm sortBy và sortOrder nếu có
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    
    // Thêm status filter nếu có
    if (params.status && params.status !== "all") {
      queryParams.status = params.status;
    }

    let url;
    
    // Nếu có keyword, dùng endpoint search
    if (params.keyword && params.keyword.trim()) {
      queryParams.keyword = params.keyword.trim();
      url = "/staff/search";
    } 
    // Nếu có role filter (không có keyword), dùng endpoint filter
    else if (params.role && params.role !== "all") {
      queryParams.role = params.role;
      url = "/staff/filter";
    } 
    // Mặc định dùng endpoint list
    else {
      url = "/staff";
    }

    console.log("🔍 [Saga] Fetching staff list:", { url, queryParams, fullUrl: `http://localhost:3001${url}` });
    
    const res = yield call(() => apiClient.get(url, { params: queryParams }));
  
    let payload = res.data;

    // Xử lý response từ backend
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
    
    // Nếu là lỗi 401 hoặc 403, có thể là vấn đề về token
    if (err.response?.status === 401) {
      console.error("[Saga] Unauthorized - Token may be invalid or expired");
    } else if (err.response?.status === 403) {
      console.error("[Saga] Forbidden - User may not have admin role");
    }
    
    yield put({
      type: STAFF_LIST_FAILURE,
      payload: err.response?.data?.message || err.message,
    });
    toast.error(err.response?.data?.message || "Lỗi khi tải danh sách nhân viên");
  }
}

// Tạo staff mới
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
      toast.success(response.data.message || "Tạo nhân viên thành công");

      // Reload list với params hiện tại
      const currentParams = yield select((state) => state.staff.params);
      yield put({ type: STAFF_LIST_REQUEST, payload: currentParams });
    } else {
      throw new Error(response.data?.message || "Tạo nhân viên thất bại");
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

// Cập nhật trạng thái staff (active/inactive)
function* updateStaffStatus(action) {
  try {
    const { staffId, status } = action.payload;
    const response = yield call(() =>
      apiClient.put(`/staff/status/${staffId}`, { status })
    );

    if (response.data?.status === "OK") {
      yield put({ type: STAFF_UPDATE_STATUS_SUCCESS });
      toast.success(response.data.message || "Cập nhật trạng thái nhân viên thành công");

      // Reload list với params hiện tại
      const currentParams = yield select((state) => state.staff.params);
      yield put({ type: STAFF_LIST_REQUEST, payload: currentParams });
    } else {
      throw new Error(response.data?.message || "Cập nhật trạng thái thất bại");
    }
  } catch (err) {
    console.error("❌ [Saga] Update staff status error:", err);
    const message = err.response?.data?.message || err.message;
    yield put({ type: STAFF_UPDATE_STATUS_FAILURE, payload: message });
    toast.error(message);
  }
}

// Cập nhật thông tin staff
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
      toast.success(response.data.message || "Cập nhật thông tin nhân viên thành công");

      // Reload list với params hiện tại
      const currentParams = yield select((state) => state.staff.params);
      yield put({ type: STAFF_LIST_REQUEST, payload: currentParams });
    } else {
      throw new Error(response.data?.message || "Cập nhật thông tin thất bại");
    }
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    yield put({ type: STAFF_UPDATE_FAILURE, payload: message });
    toast.error(message);
  }
}

// Lấy chi tiết staff
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
    toast.error(err.response?.data?.message || "Lỗi khi tải thông tin nhân viên");
  }
}

export default function* staffSaga() {
  yield takeLatest(STAFF_LIST_REQUEST, fetchStaffList);
  yield takeLatest(STAFF_CREATE_REQUEST, createStaff);
  yield takeLatest(STAFF_UPDATE_STATUS_REQUEST, updateStaffStatus);
  yield takeLatest(STAFF_UPDATE_REQUEST, updateStaff);
  yield takeLatest(STAFF_DETAIL_REQUEST, fetchStaffDetail);
}
