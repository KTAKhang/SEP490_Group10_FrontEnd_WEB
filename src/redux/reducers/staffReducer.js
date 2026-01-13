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

const initialState = {
  list: [],
  pagination: { page: 1, limit: 10, total: 0 },
  loading: false,
  error: null,
  detail: null,
  params: { page: 1, limit: 10 }, 
};

export default function staffReducer(state = initialState, action) {
  switch (action.type) {
    case STAFF_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        params: action.payload || state.params, 
      };
    case STAFF_LIST_SUCCESS:
      const newState = {
        ...state,
        loading: false,
        list: action.payload?.data || [],
        pagination: action.payload?.pagination || { page: 1, limit: 10, total: 0 },
      };
      return newState;
    case STAFF_LIST_FAILURE:
  
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case STAFF_CREATE_REQUEST:
    case STAFF_UPDATE_STATUS_REQUEST:
    case STAFF_UPDATE_REQUEST:
    case STAFF_DETAIL_REQUEST:
      return { ...state, loading: true, error: null };

    case STAFF_CREATE_SUCCESS:
    case STAFF_UPDATE_STATUS_SUCCESS:
    case STAFF_UPDATE_SUCCESS:
      return { ...state, loading: false };

    case STAFF_CREATE_FAILURE:
    case STAFF_UPDATE_STATUS_FAILURE:
    case STAFF_UPDATE_FAILURE:
    case STAFF_DETAIL_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case STAFF_DETAIL_SUCCESS:
      return { ...state, loading: false, detail: action.payload };

    default:
      return state;
  }
}
