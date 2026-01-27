/**
 * author: KhoanDCE170420
 * customerActions.js
 * Action creators and action types for customer-related actions
 */
// Action types
// Customer list actions
export const CUSTOMER_LIST_REQUEST = "CUSTOMER_LIST_REQUEST";
export const CUSTOMER_LIST_SUCCESS = "CUSTOMER_LIST_SUCCESS";
export const CUSTOMER_LIST_FAILURE = "CUSTOMER_LIST_FAILURE";
// Update customer status actions
export const CUSTOMER_UPDATE_STATUS_REQUEST = "CUSTOMER_UPDATE_STATUS_REQUEST";
export const CUSTOMER_UPDATE_STATUS_SUCCESS = "CUSTOMER_UPDATE_STATUS_SUCCESS";
export const CUSTOMER_UPDATE_STATUS_FAILURE = "CUSTOMER_UPDATE_STATUS_FAILURE";
// Customer detail actions
export const CUSTOMER_DETAIL_REQUEST = "CUSTOMER_DETAIL_REQUEST";
export const CUSTOMER_DETAIL_SUCCESS = "CUSTOMER_DETAIL_SUCCESS";
export const CUSTOMER_DETAIL_FAILURE = "CUSTOMER_DETAIL_FAILURE";
// Customer orders actions
export const CUSTOMER_ORDERS_REQUEST = "CUSTOMER_ORDERS_REQUEST";
export const CUSTOMER_ORDERS_SUCCESS = "CUSTOMER_ORDERS_SUCCESS";
export const CUSTOMER_ORDERS_FAILURE = "CUSTOMER_ORDERS_FAILURE";

// Action creators
export const customerListRequest = (params) => ({
  type: CUSTOMER_LIST_REQUEST,
  payload: params,
});

export const updateCustomerStatusRequest = (customerId, status) => ({
  type: CUSTOMER_UPDATE_STATUS_REQUEST,
  payload: { customerId, status },
});

export const customerDetailRequest = (id) => ({
  type: CUSTOMER_DETAIL_REQUEST,
  payload: id,
});

export const customerOrdersRequest = (customerId) => ({
  type: CUSTOMER_ORDERS_REQUEST,
  payload: customerId,
});
