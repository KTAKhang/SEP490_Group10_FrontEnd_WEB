import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";

import {
  ORDER_CREATE_REQUEST,
  RETRY_PAYMENT_REQUEST,
  ORDER_CANCEL_REQUEST,
  ORDER_HISTORY_REQUEST,
  ORDER_DETAIL_REQUEST,
  ORDER_ADMIN_LIST_REQUEST,
  ORDER_ADMIN_UPDATE_REQUEST,
  ORDER_CONFIRM_REFUND_PAYMENT_REQUEST,
  ORDER_ADMIN_DETAIL_REQUEST,
  ORDER_ADMIN_STATS_REQUEST,
  ORDER_STATUS_LOGS_REQUEST,
  orderCreateSuccess,
  orderCreateFailure,
  retryPaymentSuccess,
  retryPaymentFailure,
  orderCancelSuccess,
  orderCancelFailure,
  orderHistorySuccess,
  orderHistoryFailure,
  orderDetailSuccess,
  orderDetailFailure,
  orderAdminListSuccess,
  orderAdminListFailure,
  orderAdminUpdateSuccess,
  orderAdminUpdateFailure,
  orderAdminDetailRequest,
  orderAdminDetailSuccess,
  orderAdminDetailFailure,
  orderAdminStatsSuccess,
  orderAdminStatsFailure,
  orderStatusLogsSuccess,
  orderStatusLogsFailure,
} from "../actions/orderActions";

// ===== NORMALIZE API RESPONSE =====

const getOrderDiscount = (order) => ({
  discount_code: order?.discount_code ?? order?.discountCode ?? null,
  discount_amount: order?.discount_amount ?? order?.discountAmount ?? 0,
});

const normalizeOrderForDisplay = (order) => {
  if (!order) return order;

  const { discount_code, discount_amount } = getOrderDiscount(order);

  return {
    ...order,
    discount_code,
    discount_amount,
    total_price: order.total_price ?? order.totalPrice,
    subtotal_products: order.subtotal_products ?? order.subtotalProducts,
  };
};

const normalizeOrderDetailItem = (item) => {
  if (!item) return item;

  const original_price = item.original_price ?? item.originalPrice ?? null;
  const price = item.price ?? null;

  return {
    ...item,
    price,
    original_price,
  };
};

const normalizeOrderDetailPayload = (payload) => {
  const order = normalizeOrderForDisplay(payload?.order);
  const details = (payload?.details ?? []).map(normalizeOrderDetailItem);

  return {
    ...payload,
    order,
    details,
  };
};

// ===== API =====

const apiCreateOrder = async (
  selected_product_ids,
  receiverInfo,
  payment_method,
  city,
) => {
  const res = await apiClient.post("/order/create", {
    selected_product_ids,
    receiverInfo,
    payment_method,
    city,
  });

  return res.data;
};

const apiApplyDiscount = async (orderId, discountId, orderValue) => {
  const res = await apiClient.post("/discounts/customer/apply", {
    discountId,
    orderValue,
    orderId,
  });

  return res.data;
};

const apiGetVnpayUrl = async (order_id) => {
  const res = await apiClient.post("/payment/vnpay/create", {
    order_id,
  });

  return res.data;
};

const apiRetryPayment = async (order_id) => {
  const res = await apiClient.post("/order/retry-payment", {
    order_id,
    isMobile: false,
  });

  return res.data;
};

const apiCancelOrder = async (order_id) => {
  const res = await apiClient.put(`/order/cancel/${order_id}`);
  return res.data;
};

const apiGetMyOrders = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  if (params.search && String(params.search).trim()) {
    queryParams.append("search", String(params.search).trim());
  }

  if (Array.isArray(params.status_names) && params.status_names.length > 0) {
    queryParams.append("status_names", params.status_names.join(","));
  } else if (params.status_name && params.status_name !== "ALL") {
    queryParams.append("status_name", params.status_name);
  }

  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const res = await apiClient.get(`/order/my-orders?${queryParams.toString()}`);

  return res.data;
};

const apiGetMyOrderById = async (order_id) => {
  const res = await apiClient.get(`/order/my-orders/${order_id}`);
  return res.data;
};

const apiGetAdminOrders = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);

  if (Array.isArray(params.status_names) && params.status_names.length > 0) {
    queryParams.append("status_names", params.status_names.join(","));
  }

  if (params.payment_method)
    queryParams.append("payment_method", params.payment_method);
  if (params.payment_status)
    queryParams.append("payment_status", params.payment_status);

  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const res = await apiClient.get(`/order?${queryParams.toString()}`);

  return res.data;
};

const apiUpdateOrderAdmin = async (order_id, status_name, note) => {
  const res = await apiClient.put(`/order/update/${order_id}`, {
    status_name,
    note,
  });

  return res.data;
};

const apiConfirmRefundPayment = async (order_id) => {
  const res = await apiClient.put(`/order/${order_id}/payment-refund-done`);
  return res.data;
};

const apiGetAdminOrderDetail = async (order_id) => {
  const res = await apiClient.get(`/order/${order_id}`);
  return res.data;
};

const apiGetAdminOrderStats = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.groupBy != null) query.append("groupBy", params.groupBy);
  if (params.year != null) query.append("year", params.year);

  const qs = query.toString();

  const res = await apiClient.get(`/order/stats${qs ? `?${qs}` : ""}`);

  return res.data;
};

const apiGetOrderStatusLogsList = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString();

  const res = await apiClient.get(
    `/order/status-logs${query ? `?${query}` : ""}`,
  );

  return res.data;
};

// ===== SAGAS =====

// CREATE ORDER
function* orderCreateSaga(action) {
  try {
    const {
      selected_product_ids,
      receiverInfo,
      payment_method,
      discountInfo,
      city,
    } = action.payload;

    const res = yield call(
      apiCreateOrder,
      selected_product_ids,
      receiverInfo,
      payment_method,
      city,
    );

    if (res.success) {
      yield put(orderCreateSuccess(res));

      localStorage.removeItem("checkout_session_id");

      if (res.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }

      if (res.payment_url) {
        if (discountInfo && res.order_id) {
          const applyRes = yield call(
            apiApplyDiscount,
            res.order_id,
            discountInfo.discountId,
            discountInfo.orderValue,
          );

          if (applyRes?.status !== "OK") {
            throw new Error(
              applyRes?.message || "Failed to apply discount code",
            );
          }

          const urlRes = yield call(apiGetVnpayUrl, res.order_id);

          if (urlRes?.success && urlRes?.payUrl) {
            window.location.href = urlRes.payUrl;
            return;
          }
        }

        window.location.href = res.payment_url;
      } else {
        toast.success("Order placed successfully");
      }
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderCreateFailure(msg));

    if (msg && msg.toLowerCase().includes("holding period has expired")) {
      toast.error(
        "The holding period has expired. Please return to your cart and complete checkout again.",
      );
    } else {
      toast.error(msg);
    }
  }
}

// RETRY PAYMENT
function* retryPaymentSaga(action) {
  try {
    const { order_id } = action.payload;

    const res = yield call(apiRetryPayment, order_id);

    if (res.success) {
      yield put(retryPaymentSuccess(res));

      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        toast.success("Payment retried successfully");
      }
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(retryPaymentFailure(msg));

    toast.error(msg);
  }
}

// CANCEL ORDER
function* orderCancelSaga(action) {
  try {
    const { order_id } = action.payload;

    const res = yield call(apiCancelOrder, order_id);

    if (res.success) {
      yield put(orderCancelSuccess(res.message));

      toast.success(res.message);
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderCancelFailure(msg));

    toast.error(msg);
  }
}

// ORDER HISTORY
function* orderHistorySaga(action) {
  try {
    const res = yield call(apiGetMyOrders, action.payload || {});

    if (res.status === "OK") {
      const data = (res.data || []).map(normalizeOrderForDisplay);

      yield put(orderHistorySuccess({ ...res, data }));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderHistoryFailure(msg));
  }
}

// ORDER DETAIL
function* orderDetailSaga(action) {
  try {
    const { order_id } = action.payload;

    const res = yield call(apiGetMyOrderById, order_id);

    if (res.status === "OK") {
      const normalized = normalizeOrderDetailPayload(res.data);

      yield put(orderDetailSuccess(normalized));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderDetailFailure(msg));
  }
}

// ADMIN ORDER LIST
function* orderAdminListSaga(action) {
  try {
    const res = yield call(apiGetAdminOrders, action.payload || {});

    if (res.status === "OK") {
      const data = (res.data || []).map(normalizeOrderForDisplay);

      yield put(orderAdminListSuccess({ ...res, data }));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderAdminListFailure(msg));
  }
}

// ADMIN UPDATE
function* orderAdminUpdateSaga(action) {
  try {
    const { order_id, status_name, note } = action.payload;

    const res = yield call(apiUpdateOrderAdmin, order_id, status_name, note);

    if (res.success) {
      yield put(orderAdminUpdateSuccess(res.message));

      toast.success(res.message);
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderAdminUpdateFailure(msg));

    toast.error(msg);
  }
}

// CONFIRM REFUND
function* confirmRefundPaymentSaga(action) {
  try {
    const { order_id } = action.payload;

    const res = yield call(apiConfirmRefundPayment, order_id);

    if (res.success) {
      yield put(orderAdminUpdateSuccess(res.message));

      toast.success(res.message || "Refund confirmed");

      yield put(orderAdminDetailRequest(order_id));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderAdminUpdateFailure(msg));

    toast.error(msg);
  }
}

// ADMIN ORDER DETAIL
function* orderAdminDetailSaga(action) {
  try {
    const { order_id } = action.payload;

    const res = yield call(apiGetAdminOrderDetail, order_id);

    if (res.status === "OK") {
      const normalized = normalizeOrderDetailPayload(res.data);

      yield put(orderAdminDetailSuccess(normalized));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderAdminDetailFailure(msg));
  }
}

// ADMIN STATS
function* orderAdminStatsSaga(action) {
  try {
    const res = yield call(apiGetAdminOrderStats, action.payload || {});

    if (res.status === "OK") {
      yield put(orderAdminStatsSuccess(res.data));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderAdminStatsFailure(msg));
  }
}

// STATUS LOGS
function* orderStatusLogsSaga(action) {
  try {
    const res = yield call(apiGetOrderStatusLogsList, action.payload || {});

    if (res.status === "OK") {
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

      const pagination = res.pagination || null;

      yield put(orderStatusLogsSuccess(data, pagination));
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;

    yield put(orderStatusLogsFailure(msg));
  }
}

// ===== WATCHER =====

export default function* orderSaga() {
  yield takeLatest(ORDER_CREATE_REQUEST, orderCreateSaga);

  yield takeLatest(RETRY_PAYMENT_REQUEST, retryPaymentSaga);

  yield takeLatest(ORDER_CANCEL_REQUEST, orderCancelSaga);

  yield takeLatest(ORDER_HISTORY_REQUEST, orderHistorySaga);

  yield takeLatest(ORDER_DETAIL_REQUEST, orderDetailSaga);

  yield takeLatest(ORDER_ADMIN_LIST_REQUEST, orderAdminListSaga);

  yield takeLatest(ORDER_ADMIN_UPDATE_REQUEST, orderAdminUpdateSaga);

  yield takeLatest(
    ORDER_CONFIRM_REFUND_PAYMENT_REQUEST,
    confirmRefundPaymentSaga,
  );

  yield takeLatest(ORDER_ADMIN_DETAIL_REQUEST, orderAdminDetailSaga);

  yield takeLatest(ORDER_ADMIN_STATS_REQUEST, orderAdminStatsSaga);

  yield takeLatest(ORDER_STATUS_LOGS_REQUEST, orderStatusLogsSaga);
}
