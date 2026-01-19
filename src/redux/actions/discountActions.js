/**
 * author: KHoanDCE170420
 * discountActions.js
 * Action creators and action types for discount-related actions
 */

// Discount Action Types definitions for discount management
export const DISCOUNT_LIST_REQUEST = "DISCOUNT_LIST_REQUEST";
export const DISCOUNT_LIST_SUCCESS = "DISCOUNT_LIST_SUCCESS";
export const DISCOUNT_LIST_FAILURE = "DISCOUNT_LIST_FAILURE";

export const DISCOUNT_CREATE_REQUEST = "DISCOUNT_CREATE_REQUEST";
export const DISCOUNT_CREATE_SUCCESS = "DISCOUNT_CREATE_SUCCESS";
export const DISCOUNT_CREATE_FAILURE = "DISCOUNT_CREATE_FAILURE";

export const DISCOUNT_UPDATE_REQUEST = "DISCOUNT_UPDATE_REQUEST";
export const DISCOUNT_UPDATE_SUCCESS = "DISCOUNT_UPDATE_SUCCESS";
export const DISCOUNT_UPDATE_FAILURE = "DISCOUNT_UPDATE_FAILURE";

export const DISCOUNT_UPDATE_ADMIN_REQUEST = "DISCOUNT_UPDATE_ADMIN_REQUEST";
export const DISCOUNT_UPDATE_ADMIN_SUCCESS = "DISCOUNT_UPDATE_ADMIN_SUCCESS";
export const DISCOUNT_UPDATE_ADMIN_FAILURE = "DISCOUNT_UPDATE_ADMIN_FAILURE";

export const DISCOUNT_APPROVE_REQUEST = "DISCOUNT_APPROVE_REQUEST";
export const DISCOUNT_APPROVE_SUCCESS = "DISCOUNT_APPROVE_SUCCESS";
export const DISCOUNT_APPROVE_FAILURE = "DISCOUNT_APPROVE_FAILURE";

export const DISCOUNT_REJECT_REQUEST = "DISCOUNT_REJECT_REQUEST";
export const DISCOUNT_REJECT_SUCCESS = "DISCOUNT_REJECT_SUCCESS";
export const DISCOUNT_REJECT_FAILURE = "DISCOUNT_REJECT_FAILURE";

export const DISCOUNT_ACTIVATE_REQUEST = "DISCOUNT_ACTIVATE_REQUEST";
export const DISCOUNT_ACTIVATE_SUCCESS = "DISCOUNT_ACTIVATE_SUCCESS";
export const DISCOUNT_ACTIVATE_FAILURE = "DISCOUNT_ACTIVATE_FAILURE";

export const DISCOUNT_DEACTIVATE_REQUEST = "DISCOUNT_DEACTIVATE_REQUEST";
export const DISCOUNT_DEACTIVATE_SUCCESS = "DISCOUNT_DEACTIVATE_SUCCESS";
export const DISCOUNT_DEACTIVATE_FAILURE = "DISCOUNT_DEACTIVATE_FAILURE";

export const DISCOUNT_DETAIL_REQUEST = "DISCOUNT_DETAIL_REQUEST";
export const DISCOUNT_DETAIL_SUCCESS = "DISCOUNT_DETAIL_SUCCESS";
export const DISCOUNT_DETAIL_FAILURE = "DISCOUNT_DETAIL_FAILURE";

export const DISCOUNT_VALIDATE_REQUEST = "DISCOUNT_VALIDATE_REQUEST";
export const DISCOUNT_VALIDATE_SUCCESS = "DISCOUNT_VALIDATE_SUCCESS";
export const DISCOUNT_VALIDATE_FAILURE = "DISCOUNT_VALIDATE_FAILURE";

export const DISCOUNT_GET_VALID_REQUEST = "DISCOUNT_GET_VALID_REQUEST";
export const DISCOUNT_GET_VALID_SUCCESS = "DISCOUNT_GET_VALID_SUCCESS";
export const DISCOUNT_GET_VALID_FAILURE = "DISCOUNT_GET_VALID_FAILURE";

// Action Creators for discount management
export const discountListRequest = (params) => ({
    type: DISCOUNT_LIST_REQUEST,
    payload: params,
});

export const discountCreateRequest = (data) => ({
    type: DISCOUNT_CREATE_REQUEST,
    payload: data,
});

export const discountUpdateRequest = (discountId, data) => ({
    type: DISCOUNT_UPDATE_REQUEST,
    payload: { discountId, data },
});

export const discountUpdateAdminRequest = (discountId, data) => ({
    type: DISCOUNT_UPDATE_ADMIN_REQUEST,
    payload: { discountId, data },
});

export const discountApproveRequest = (discountId) => ({
    type: DISCOUNT_APPROVE_REQUEST,
    payload: discountId,
});

export const discountRejectRequest = (discountId, rejectionReason) => ({
    type: DISCOUNT_REJECT_REQUEST,
    payload: { discountId, rejectionReason },
});

export const discountActivateRequest = (discountId) => ({
    type: DISCOUNT_ACTIVATE_REQUEST,
    payload: discountId,
});

export const discountDeactivateRequest = (discountId) => ({
    type: DISCOUNT_DEACTIVATE_REQUEST,
    payload: discountId,
});

export const discountDetailRequest = (discountId) => ({
    type: DISCOUNT_DETAIL_REQUEST,
    payload: discountId,
});

export const discountValidateRequest = (code, orderValue) => ({
    type: DISCOUNT_VALIDATE_REQUEST,
    payload: { code, orderValue },
});

export const discountGetValidRequest = () => ({
    type: DISCOUNT_GET_VALID_REQUEST,
});
