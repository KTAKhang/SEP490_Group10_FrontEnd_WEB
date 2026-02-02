/**
 * author: KHoanDCE170420
 * Discount Reducer
 * Handles discount-related state management
 */
import {
    DISCOUNT_LIST_REQUEST,
    DISCOUNT_LIST_SUCCESS,
    DISCOUNT_LIST_FAILURE,
    DISCOUNT_CREATE_REQUEST,
    DISCOUNT_CREATE_SUCCESS,
    DISCOUNT_CREATE_FAILURE,
    DISCOUNT_UPDATE_REQUEST,
    DISCOUNT_UPDATE_SUCCESS,
    DISCOUNT_UPDATE_FAILURE,
    DISCOUNT_UPDATE_ADMIN_REQUEST,
    DISCOUNT_UPDATE_ADMIN_SUCCESS,
    DISCOUNT_UPDATE_ADMIN_FAILURE,
    DISCOUNT_APPROVE_REQUEST,
    DISCOUNT_APPROVE_SUCCESS,
    DISCOUNT_APPROVE_FAILURE,
    DISCOUNT_REJECT_REQUEST,
    DISCOUNT_REJECT_SUCCESS,
    DISCOUNT_REJECT_FAILURE,
    DISCOUNT_ACTIVATE_REQUEST,
    DISCOUNT_ACTIVATE_SUCCESS,
    DISCOUNT_ACTIVATE_FAILURE,
    DISCOUNT_DEACTIVATE_REQUEST,
    DISCOUNT_DEACTIVATE_SUCCESS,
    DISCOUNT_DEACTIVATE_FAILURE,
    DISCOUNT_DETAIL_REQUEST,
    DISCOUNT_DETAIL_SUCCESS,
    DISCOUNT_DETAIL_FAILURE,
    DISCOUNT_VALIDATE_REQUEST,
    DISCOUNT_VALIDATE_SUCCESS,
    DISCOUNT_VALIDATE_FAILURE,
    DISCOUNT_GET_VALID_REQUEST,
    DISCOUNT_GET_VALID_SUCCESS,
    DISCOUNT_GET_VALID_FAILURE,
    DISCOUNT_APPLY_REQUEST,
    DISCOUNT_APPLY_SUCCESS,
    DISCOUNT_APPLY_FAILURE,
    DISCOUNT_SET_SELECTED,
    DISCOUNT_CLEAR_SELECTED,
    DISCOUNT_CLEAR_FEEDBACK,
} from "../actions/discountActions";

const initialState = {
    list: [],
    validDiscounts: [],
    pagination: { page: 1, limit: 10, total: 0 },
    statistics: null,
    loading: false,
    error: null,
    detail: null,
    validationResult: null,
    validationError: null,
    applyResult: null,
    applyError: null,
    selectedDiscount: null,
    params: { page: 1, limit: 10 },
};

export default function discountReducer(state = initialState, action) {
    switch (action.type) {
        case DISCOUNT_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                params: action.payload || state.params,
            };

        case DISCOUNT_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                list: action.payload?.data || [],
                pagination: action.payload?.pagination || { page: 1, limit: 10, total: 0 },
                statistics: action.payload?.statistics || null,
            };

        case DISCOUNT_LIST_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        //case statements for other action types
        case DISCOUNT_CREATE_REQUEST:
        case DISCOUNT_UPDATE_REQUEST:
        case DISCOUNT_UPDATE_ADMIN_REQUEST:
        case DISCOUNT_APPROVE_REQUEST:
        case DISCOUNT_REJECT_REQUEST:
        case DISCOUNT_ACTIVATE_REQUEST:
        case DISCOUNT_DEACTIVATE_REQUEST:
        case DISCOUNT_DETAIL_REQUEST:
        case DISCOUNT_VALIDATE_REQUEST:
        case DISCOUNT_GET_VALID_REQUEST:
        case DISCOUNT_APPLY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                validationError: null,
                applyError: null,
            };

        case DISCOUNT_CREATE_SUCCESS:
        case DISCOUNT_UPDATE_SUCCESS:
        case DISCOUNT_UPDATE_ADMIN_SUCCESS:
        case DISCOUNT_APPROVE_SUCCESS:
        case DISCOUNT_REJECT_SUCCESS:
        case DISCOUNT_ACTIVATE_SUCCESS:
        case DISCOUNT_DEACTIVATE_SUCCESS:
            return {
                ...state,
                loading: false,
            };

        case DISCOUNT_DETAIL_SUCCESS:
            return {
                ...state,
                loading: false,
                detail: action.payload,
            };

        case DISCOUNT_VALIDATE_SUCCESS:
            return {
                ...state,
                loading: false,
                validationResult: action.payload,
                validationError: null,
            };

        case DISCOUNT_GET_VALID_SUCCESS:
            return {
                ...state,
                loading: false,
                validDiscounts: action.payload?.data || [],
            };

        case DISCOUNT_APPLY_SUCCESS:
            return {
                ...state,
                loading: false,
                applyResult: action.payload,
                applyError: null,
            };

        case DISCOUNT_SET_SELECTED:
            return {
                ...state,
                selectedDiscount: action.payload,
                validationResult: null,
                validationError: null,
                applyResult: null,
                applyError: null,
            };

        case DISCOUNT_CLEAR_SELECTED:
            return {
                ...state,
                selectedDiscount: null,
                validationResult: null,
                validationError: null,
                applyResult: null,
                applyError: null,
            };

        case DISCOUNT_CLEAR_FEEDBACK:
            return {
                ...state,
                validationResult: null,
                validationError: null,
                applyResult: null,
                applyError: null,
            };

        case DISCOUNT_CREATE_FAILURE:
        case DISCOUNT_UPDATE_FAILURE:
        case DISCOUNT_UPDATE_ADMIN_FAILURE:
        case DISCOUNT_APPROVE_FAILURE:
        case DISCOUNT_REJECT_FAILURE:
        case DISCOUNT_ACTIVATE_FAILURE:
        case DISCOUNT_DEACTIVATE_FAILURE:
        case DISCOUNT_DETAIL_FAILURE:
        case DISCOUNT_VALIDATE_FAILURE:
        case DISCOUNT_GET_VALID_FAILURE:
        case DISCOUNT_APPLY_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                validationError:
                    action.type === DISCOUNT_VALIDATE_FAILURE
                        ? action.payload
                        : state.validationError,
                applyError:
                    action.type === DISCOUNT_APPLY_FAILURE
                        ? action.payload
                        : state.applyError,
            };

        default:
            return state;
    }
}
