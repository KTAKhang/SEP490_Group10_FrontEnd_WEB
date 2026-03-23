export const GET_WAREHOUSE_DASHBOARD_STATS_REQUEST =
  "GET_WAREHOUSE_DASHBOARD_STATS_REQUEST";
export const GET_WAREHOUSE_DASHBOARD_STATS_SUCCESS =
  "GET_WAREHOUSE_DASHBOARD_STATS_SUCCESS";
export const GET_WAREHOUSE_DASHBOARD_STATS_FAILURE =
  "GET_WAREHOUSE_DASHBOARD_STATS_FAILURE";

export const getWarehouseDashboardStatsRequest = (params = {}) => ({
  type: GET_WAREHOUSE_DASHBOARD_STATS_REQUEST,
  payload: params,
});

export const getWarehouseDashboardStatsSuccess = (data) => ({
  type: GET_WAREHOUSE_DASHBOARD_STATS_SUCCESS,
  payload: data,
});

export const getWarehouseDashboardStatsFailure = (error) => ({
  type: GET_WAREHOUSE_DASHBOARD_STATS_FAILURE,
  payload: error,
});
