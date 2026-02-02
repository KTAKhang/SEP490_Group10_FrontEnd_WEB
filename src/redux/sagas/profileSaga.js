import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import axios from "axios";
import {
    UPDATE_PROFILE_REQUEST,
    updateProfileSuccess,
    updateProfileFailure,
    CHANGE_PASSWORD_REQUEST,
    changePasswordSuccess,
    changePasswordFailure,
    GET_PROFILE_REQUEST,
    getProfileSuccess,
    getProfileFailure,
} from "../actions/profileAction";

const API_BASE_URL = "http://localhost:3001";

// ===== API CALLS CƠ BẢN =====
const apiCall = async (method, url, data = null, isForm = false) => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      withCredentials: true,
      headers: {
        "Content-Type": isForm ? "multipart/form-data" : "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });

    return res.data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    /* =======================
       401 – TOKEN EXPIRED / INVALID
    ======================== */
    if (status === 401) {
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data?.token?.access_token;

        if (newToken) {
          localStorage.setItem("token", newToken);

          // retry request
          const retryRes = await axios({
            method,
            url: `${API_BASE_URL}${url}`,
            data,
            withCredentials: true,
            headers: {
              "Content-Type": isForm
                ? "multipart/form-data"
                : "application/json",
              Authorization: `Bearer ${newToken}`,
            },
          });

          return retryRes.data;
        }
      } catch (refreshError) {
        clearAuthAndRedirect();
      }
    }

    /* =======================
       403 – ACCOUNT LOCKED
    ======================== */
    if (status === 403 && message === "Account is locked") {
      alert("🚫 Your account has been locked by the admin");
      clearAuthAndRedirect();
      return;
    }

    /* =======================
       403 – ACCESS DENIED
    ======================== */
    if (status === 403 && message === "Access denied") {
      alert("⛔ You do not have permission to access this function");
      return;
    }

    throw error;
  }
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};



// ===== SAGAS =====
function* updateProfileSaga(action) {
    try {
        const response = yield call(() => apiCall("put", "/profile/update-user", action.payload, true));

        if (response.status === "OK") {
            yield put(updateProfileSuccess(response.message, response.data));

            // cập nhật localStorage user
            const storedUser = JSON.parse(localStorage.getItem("user")) || {};
            const updatedUser = { ...storedUser, ...response.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast.success(response.message || "Cập nhật thành công!");
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        const msg = error.response?.data?.message || error.message || "Cập nhật thất bại";
        yield put(updateProfileFailure(msg));
        toast.error(msg);
    }
}

function* changePasswordSaga(action) {
    try {
        const response = yield call(() => apiCall("put", "/profile/change-password", action.payload));
        if (response.status === "OK") {
            yield put(changePasswordSuccess(response.message));
            toast.success(response.message || "Đổi mật khẩu thành công!");
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        const msg = error.response?.data?.message || error.message || "Đổi mật khẩu thất bại";
        yield put(changePasswordFailure(msg));
        toast.error(msg);
    }
}

function* getProfileSaga() {
    try {
        const response = yield call(() => apiCall("get", "/profile/user-info"));
        if (response.status === "OK") {
            yield put(getProfileSuccess(response.data));
            
            // Sync localStorage với Redux state
            const storedUser = JSON.parse(localStorage.getItem("user")) || {};
            const updatedUser = { ...storedUser, ...response.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        const msg = error.response?.data?.message || error.message || "Lấy thông tin thất bại";
        yield put(getProfileFailure(msg));
        // Don't show toast error for profile fetch on mount (too noisy)
        // toast.error(msg);
    }
}

// ===== ROOT SAGA =====
export default function* profileSaga() {
    yield takeLatest(UPDATE_PROFILE_REQUEST, updateProfileSaga);
    yield takeLatest(CHANGE_PASSWORD_REQUEST, changePasswordSaga);
    yield takeLatest(GET_PROFILE_REQUEST, getProfileSaga);
}
