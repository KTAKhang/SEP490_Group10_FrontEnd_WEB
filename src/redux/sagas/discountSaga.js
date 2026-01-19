/**
 * author: KHoanDCE170420
 * Discount Saga
 * Handles discount-related async operations
 */
import { takeLatest, call, put, select } from "redux-saga/effects";
import apiClient from "../../utils/axiosConfig";
import { toast } from "react-toastify";
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
} from "../actions/discountActions";

// Get discount list
function* fetchDiscountList(action) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token not found. Please log in again.");
        }

        const params = action.payload || {};
        const queryParams = {
            page: params.page || 1,
            limit: params.limit || 10,
        };

        if (params.status) queryParams.status = params.status;
        if (params.isActive !== undefined) queryParams.isActive = params.isActive;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

        const res = yield call(() => apiClient.get("/discounts", { params: queryParams }));

        let payload = res.data;

        if (payload && payload.status === "OK") {
            payload = {
                data: payload.data || [],
                pagination: payload.pagination || { page: 1, limit: 10, total: 0 },
            };
        } else {
            payload = {
                data: [],
                pagination: { page: 1, limit: 10, total: 0 },
            };
        }

        yield put({ type: DISCOUNT_LIST_SUCCESS, payload });
    } catch (err) {
        console.error("[Saga] Fetch discount list error:", err);
        yield put({
            type: DISCOUNT_LIST_FAILURE,
            payload: err.response?.data?.message || err.message,
        });
        toast.error(err.response?.data?.message || "Error loading discount list");
    }
}

// Create discount
function* createDiscount(action) {
    try {
        const response = yield call(() => apiClient.post("/discounts", action.payload));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_CREATE_SUCCESS });
            toast.success(response.data.message || "Discount created successfully");

            // Reload list with current params
            const currentParams = yield select((state) => state.discount.params);
            yield put({ type: DISCOUNT_LIST_REQUEST, payload: currentParams });
        } else {
            throw new Error(response.data?.message || "Failed to create discount");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({
            type: DISCOUNT_CREATE_FAILURE,
            payload: message,
        });
        toast.error(message);
    }
}

// Update discount (staff)
function* updateDiscount(action) {
    try {
        const { discountId, data } = action.payload;
        const response = yield call(() => apiClient.put(`/discounts/${discountId}`, data));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_UPDATE_SUCCESS });
            toast.success(response.data.message || "Discount updated successfully");

            // Reload list with current params
            const currentParams = yield select((state) => state.discount.params);
            yield put({ type: DISCOUNT_LIST_REQUEST, payload: currentParams });
        } else {
            throw new Error(response.data?.message || "Failed to update discount");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({ type: DISCOUNT_UPDATE_FAILURE, payload: message });
        toast.error(message);
    }
}

// Update discount (admin)
function* updateDiscountAdmin(action) {
    try {
        const { discountId, data } = action.payload;
        const response = yield call(() => apiClient.put(`/discounts/${discountId}/admin`, data));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_UPDATE_ADMIN_SUCCESS });
            toast.success(response.data.message || "Discount updated successfully");

            // Reload list with current params
            const currentParams = yield select((state) => state.discount.params);
            yield put({ type: DISCOUNT_LIST_REQUEST, payload: currentParams });
        } else {
            throw new Error(response.data?.message || "Failed to update discount");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({ type: DISCOUNT_UPDATE_ADMIN_FAILURE, payload: message });
        toast.error(message);
    }
}

// Approve discount
function* approveDiscount(action) {
    try {
        const discountId = action.payload;
        const response = yield call(() => apiClient.put(`/discounts/${discountId}/approve`));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_APPROVE_SUCCESS });
            toast.success(response.data.message || "Discount approved successfully");

            // Reload list with current params
            const currentParams = yield select((state) => state.discount.params);
            yield put({ type: DISCOUNT_LIST_REQUEST, payload: currentParams });
        } else {
            throw new Error(response.data?.message || "Failed to approve discount");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({ type: DISCOUNT_APPROVE_FAILURE, payload: message });
        toast.error(message);
    }
}

// Reject discount
function* rejectDiscount(action) {
    try {
        const { discountId, rejectionReason } = action.payload;
        const response = yield call(() => apiClient.put(`/discounts/${discountId}/reject`, { rejectionReason }));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_REJECT_SUCCESS });
            toast.success(response.data.message || "Discount rejected successfully");

            // Reload list with current params
            const currentParams = yield select((state) => state.discount.params);
            yield put({ type: DISCOUNT_LIST_REQUEST, payload: currentParams });
        } else {
            throw new Error(response.data?.message || "Failed to reject discount");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({ type: DISCOUNT_REJECT_FAILURE, payload: message });
        toast.error(message);
    }
}

// Activate discount
function* activateDiscount(action) {
    try {
        const discountId = action.payload;
        const response = yield call(() => apiClient.put(`/discounts/${discountId}/activate`));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_ACTIVATE_SUCCESS });
            toast.success(response.data.message || "Discount activated successfully");

            // Reload list with current params
            const currentParams = yield select((state) => state.discount.params);
            yield put({ type: DISCOUNT_LIST_REQUEST, payload: currentParams });
        } else {
            throw new Error(response.data?.message || "Failed to activate discount");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({ type: DISCOUNT_ACTIVATE_FAILURE, payload: message });
        toast.error(message);
    }
}

// Deactivate discount
function* deactivateDiscount(action) {
    try {
        const discountId = action.payload;
        const response = yield call(() => apiClient.put(`/discounts/${discountId}/deactivate`));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_DEACTIVATE_SUCCESS });
            toast.success(response.data.message || "Discount deactivated successfully");

            // Reload list with current params
            const currentParams = yield select((state) => state.discount.params);
            yield put({ type: DISCOUNT_LIST_REQUEST, payload: currentParams });
        } else {
            throw new Error(response.data?.message || "Failed to deactivate discount");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({ type: DISCOUNT_DEACTIVATE_FAILURE, payload: message });
        toast.error(message);
    }
}

// Get discount detail
function* fetchDiscountDetail(action) {
    try {
        const discountId = action.payload;
        const res = yield call(() => apiClient.get(`/discounts/${discountId}`));

        yield put({ type: DISCOUNT_DETAIL_SUCCESS, payload: res.data?.data });
    } catch (err) {
        yield put({
            type: DISCOUNT_DETAIL_FAILURE,
            payload: err.response?.data?.message || err.message,
        });
        toast.error(err.response?.data?.message || "Failed to load discount details");
    }
}

// Validate discount code
function* validateDiscountCode(action) {
    try {
        const { code, orderValue } = action.payload;
        const response = yield call(() => apiClient.post("/discounts/customer/validate", { code, orderValue }));

        if (response.data?.status === "OK") {
            yield put({ type: DISCOUNT_VALIDATE_SUCCESS, payload: response.data });
            toast.success(response.data.message || "Discount code is valid");
        } else {
            throw new Error(response.data?.message || "Invalid discount code");
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        yield put({ type: DISCOUNT_VALIDATE_FAILURE, payload: message });
        toast.error(message);
    }
}

// Get valid discounts for customer
function* getValidDiscounts(action) {
    try {
        const res = yield call(() => apiClient.get("/discounts/customer/valid"));

        if (res.data?.status === "OK") {
            yield put({ type: DISCOUNT_GET_VALID_SUCCESS, payload: res.data });
        } else {
            throw new Error(res.data?.message || "Failed to load valid discounts");
        }
    } catch (err) {
        yield put({
            type: DISCOUNT_GET_VALID_FAILURE,
            payload: err.response?.data?.message || err.message,
        });
        toast.error(err.response?.data?.message || "Failed to load valid discounts");
    }
}

export default function* discountSaga() {
    yield takeLatest(DISCOUNT_LIST_REQUEST, fetchDiscountList);
    yield takeLatest(DISCOUNT_CREATE_REQUEST, createDiscount);
    yield takeLatest(DISCOUNT_UPDATE_REQUEST, updateDiscount);
    yield takeLatest(DISCOUNT_UPDATE_ADMIN_REQUEST, updateDiscountAdmin);
    yield takeLatest(DISCOUNT_APPROVE_REQUEST, approveDiscount);
    yield takeLatest(DISCOUNT_REJECT_REQUEST, rejectDiscount);
    yield takeLatest(DISCOUNT_ACTIVATE_REQUEST, activateDiscount);
    yield takeLatest(DISCOUNT_DEACTIVATE_REQUEST, deactivateDiscount);
    yield takeLatest(DISCOUNT_DETAIL_REQUEST, fetchDiscountDetail);
    yield takeLatest(DISCOUNT_VALIDATE_REQUEST, validateDiscountCode);
    yield takeLatest(DISCOUNT_GET_VALID_REQUEST, getValidDiscounts);
}
