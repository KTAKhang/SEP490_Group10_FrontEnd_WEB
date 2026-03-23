import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  GET_WAREHOUSE_DASHBOARD_STATS_REQUEST,
  getWarehouseDashboardStatsSuccess,
  getWarehouseDashboardStatsFailure,
} from "../actions/warehouseDashboardActions";

const apiGetWarehouseDashboardStats = async (params = {}) => {
  const response = await apiClient.get("/inventory/stats/warehouse", {
    params: { page: params.page, limit: params.limit, year: params.year },
  });
  return response.data;
};

function* getWarehouseDashboardStatsSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetWarehouseDashboardStats, params);

    if (response.status === "OK") {
      yield put(getWarehouseDashboardStatsSuccess(response.data));
    } else {
      throw new Error(response.message || "Failed to load warehouse dashboard statistics");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to load warehouse dashboard statistics";
    yield put(getWarehouseDashboardStatsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* warehouseDashboardSaga() {
  yield takeLatest(
    GET_WAREHOUSE_DASHBOARD_STATS_REQUEST,
    getWarehouseDashboardStatsSaga
  );
}
