import {
  GET_FEEDBACKED_STAFF_DASHBOARD_REQUEST,
  GET_FEEDBACKED_STAFF_DASHBOARD_SUCCESS,
  GET_FEEDBACKED_STAFF_DASHBOARD_FAILURE,
} from "../actions/feedbackedStaffDashboardActions";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const feedbackedStaffDashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FEEDBACKED_STAFF_DASHBOARD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_FEEDBACKED_STAFF_DASHBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case GET_FEEDBACKED_STAFF_DASHBOARD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        data: null,
      };
    default:
      return state;
  }
};

export default feedbackedStaffDashboardReducer;
