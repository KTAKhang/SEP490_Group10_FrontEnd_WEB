// Feedbacked Staff Dashboard Actions – dùng riêng cho trang thống kê feedbacked-staff

export const GET_FEEDBACKED_STAFF_DASHBOARD_REQUEST =
  "GET_FEEDBACKED_STAFF_DASHBOARD_REQUEST";
export const GET_FEEDBACKED_STAFF_DASHBOARD_SUCCESS =
  "GET_FEEDBACKED_STAFF_DASHBOARD_SUCCESS";
export const GET_FEEDBACKED_STAFF_DASHBOARD_FAILURE =
  "GET_FEEDBACKED_STAFF_DASHBOARD_FAILURE";

export const getFeedbackedStaffDashboardRequest = () => ({
  type: GET_FEEDBACKED_STAFF_DASHBOARD_REQUEST,
});

export const getFeedbackedStaffDashboardSuccess = (data) => ({
  type: GET_FEEDBACKED_STAFF_DASHBOARD_SUCCESS,
  payload: data,
});

export const getFeedbackedStaffDashboardFailure = (error) => ({
  type: GET_FEEDBACKED_STAFF_DASHBOARD_FAILURE,
  payload: error,
});
