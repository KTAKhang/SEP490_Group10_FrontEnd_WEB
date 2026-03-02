import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_FEEDBACKED_STAFF_DASHBOARD_REQUEST,
  getFeedbackedStaffDashboardSuccess,
  getFeedbackedStaffDashboardFailure,
} from "../actions/feedbackedStaffDashboardActions";

const apiGetFeedbackedStaffDashboard = async () => {
  const response = await apiClient.get("/api/feedbacked-staff/dashboard");
  return response.data;
};

function* getFeedbackedStaffDashboardSaga() {
  try {
    const response = yield call(apiGetFeedbackedStaffDashboard);
    if (response.status === "OK") {
      yield put(getFeedbackedStaffDashboardSuccess(response.data || null));
    } else {
      throw new Error(response.message || "Không thể tải thống kê dashboard");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể tải thống kê dashboard";
    yield put(getFeedbackedStaffDashboardFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* feedbackedStaffDashboardSaga() {
  yield takeLatest(
    GET_FEEDBACKED_STAFF_DASHBOARD_REQUEST,
    getFeedbackedStaffDashboardSaga
  );
}
