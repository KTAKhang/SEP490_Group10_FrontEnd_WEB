import {
  GET_WAREHOUSE_DASHBOARD_STATS_REQUEST,
  GET_WAREHOUSE_DASHBOARD_STATS_SUCCESS,
  GET_WAREHOUSE_DASHBOARD_STATS_FAILURE,
} from "../actions/warehouseDashboardActions";

const initialState = {
  warehouseStats: null,
  warehouseStatsLoading: false,
  warehouseStatsError: null,
};

const warehouseDashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_WAREHOUSE_DASHBOARD_STATS_REQUEST:
      return {
        ...state,
        warehouseStatsLoading: true,
        warehouseStatsError: null,
      };
    case GET_WAREHOUSE_DASHBOARD_STATS_SUCCESS:
      return {
        ...state,
        warehouseStatsLoading: false,
        warehouseStats: action.payload,
        warehouseStatsError: null,
      };
    case GET_WAREHOUSE_DASHBOARD_STATS_FAILURE:
      return {
        ...state,
        warehouseStatsLoading: false,
        warehouseStatsError: action.payload,
      };
    default:
      return state;
  }
};

export default warehouseDashboardReducer;
