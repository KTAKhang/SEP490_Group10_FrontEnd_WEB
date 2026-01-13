// Action types
export const STAFF_LIST_REQUEST = "STAFF_LIST_REQUEST";
export const STAFF_LIST_SUCCESS = "STAFF_LIST_SUCCESS";
export const STAFF_LIST_FAILURE = "STAFF_LIST_FAILURE";

export const STAFF_CREATE_REQUEST = "STAFF_CREATE_REQUEST";
export const STAFF_CREATE_SUCCESS = "STAFF_CREATE_SUCCESS";
export const STAFF_CREATE_FAILURE = "STAFF_CREATE_FAILURE";

export const STAFF_UPDATE_STATUS_REQUEST = "STAFF_UPDATE_STATUS_REQUEST";
export const STAFF_UPDATE_STATUS_SUCCESS = "STAFF_UPDATE_STATUS_SUCCESS";
export const STAFF_UPDATE_STATUS_FAILURE = "STAFF_UPDATE_STATUS_FAILURE";

export const STAFF_UPDATE_REQUEST = "STAFF_UPDATE_REQUEST";
export const STAFF_UPDATE_SUCCESS = "STAFF_UPDATE_SUCCESS";
export const STAFF_UPDATE_FAILURE = "STAFF_UPDATE_FAILURE";

export const STAFF_DETAIL_REQUEST = "STAFF_DETAIL_REQUEST";
export const STAFF_DETAIL_SUCCESS = "STAFF_DETAIL_SUCCESS";
export const STAFF_DETAIL_FAILURE = "STAFF_DETAIL_FAILURE";

// Action creators
export const staffListRequest = (params) => ({
  type: STAFF_LIST_REQUEST,
  payload: params,
});

export const staffCreateRequest = (data) => ({
  type: STAFF_CREATE_REQUEST,
  payload: data,
});

export const updateStaffStatusRequest = (staffId, status) => ({
  type: STAFF_UPDATE_STATUS_REQUEST,
  payload: { staffId, status },
});

export const updateStaffRequest = (staffId, data) => ({
  type: STAFF_UPDATE_REQUEST,
  payload: { staffId, data },
});

export const staffDetailRequest = (id) => ({
  type: STAFF_DETAIL_REQUEST,
  payload: id,
});
