import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";

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

/* =========================
   UPDATE PROFILE
========================= */
function* updateProfileSaga(action) {
  try {
    const response = yield call(() =>
      apiClient.put("/profile/update-user", action.payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );

    const res = response.data;

    if (res.status === "OK") {
      yield put(updateProfileSuccess(res.message, res.data));

      // update localStorage user
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = { ...storedUser, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success(res.message || "Cập nhật thành công!");
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || "Cập nhật thất bại";

    yield put(updateProfileFailure(msg));
    toast.error(msg);
  }
}

/* =========================
   CHANGE PASSWORD
========================= */
function* changePasswordSaga(action) {
  try {
    const response = yield call(() =>
      apiClient.put("/profile/change-password", action.payload)
    );

    const res = response.data;

    if (res.status === "OK") {
      yield put(changePasswordSuccess(res.message));
      toast.success(res.message || "Đổi mật khẩu thành công!");
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || "Đổi mật khẩu thất bại";

    yield put(changePasswordFailure(msg));
    toast.error(msg);
  }
}

/* =========================
   GET PROFILE
========================= */
function* getProfileSaga() {
  try {
    const response = yield call(() =>
      apiClient.get("/profile/user-info")
    );

    const res = response.data;

    if (res.status === "OK") {
      yield put(getProfileSuccess(res.data));

      // sync localStorage
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = { ...storedUser, ...res.data };

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Lấy thông tin thất bại";

    yield put(getProfileFailure(msg));
  }
}

/* =========================
   ROOT SAGA
========================= */
export default function* profileSaga() {
  yield takeLatest(UPDATE_PROFILE_REQUEST, updateProfileSaga);
  yield takeLatest(CHANGE_PASSWORD_REQUEST, changePasswordSaga);
  yield takeLatest(GET_PROFILE_REQUEST, getProfileSaga);
}