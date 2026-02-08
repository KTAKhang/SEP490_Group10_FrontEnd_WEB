import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { toast } from "react-toastify";


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


const API_BASE_URL = "http://localhost:3001";


// ===== AUTH HEADER =====
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


// ===== API =====
const apiCreateOrder = async (
  selected_product_ids,
  receiverInfo,
  payment_method,
  city
) => {
  const res = await axios.post(
    `${API_BASE_URL}/order/create`,
    { selected_product_ids, receiverInfo, payment_method,city },
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};


const apiApplyDiscount = async (orderId, discountId, orderValue) => {
  const res = await axios.post(
    `${API_BASE_URL}/discounts/customer/apply`,
    { discountId, orderValue, orderId },
    { withCredentials: true, headers: authHeader() }
  );
  return res.data;
};


const apiGetVnpayUrl = async (order_id) => {
  const res = await axios.post(
    `${API_BASE_URL}/payment/vnpay/create`,
    { order_id },
    { withCredentials: true, headers: authHeader() }
  );
  return res.data;
};


const apiRetryPayment = async (order_id) => {
  const res = await axios.post(
    `${API_BASE_URL}/order/retry-payment`,
    {order_id},
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};


const apiCancelOrder = async (order_id) => {
  const res = await axios.put(
    `${API_BASE_URL}/order/cancel/${order_id}`,
    {},
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
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


  const res = await axios.get(
    `${API_BASE_URL}/order/my-orders?${queryParams.toString()}`,
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};


const apiGetMyOrderById = async (order_id) => {
  const res = await axios.get(`${API_BASE_URL}/order/my-orders/${order_id}`, {
    withCredentials: true,
    headers: authHeader(),
  });
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
  if (params.payment_method) queryParams.append("payment_method", params.payment_method);
  if (params.payment_status) queryParams.append("payment_status", params.payment_status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);


  const res = await axios.get(`${API_BASE_URL}/order?${queryParams.toString()}`, {
    withCredentials: true,
    headers: authHeader(),
  });
  return res.data;
};


const apiUpdateOrderAdmin = async (order_id, status_name, note) => {
  const res = await axios.put(
    `${API_BASE_URL}/order/update/${order_id}`,
    { status_name, note },
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};

const apiConfirmRefundPayment = async (order_id) => {
  const res = await axios.put(
    `${API_BASE_URL}/order/${order_id}/payment-refund-done`,
    {},
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};


const apiGetAdminOrderDetail = async (order_id) => {
  const res = await axios.get(`${API_BASE_URL}/order/${order_id}`, {
    withCredentials: true,
    headers: authHeader(),
  });
  return res.data;
};


const apiGetAdminOrderStats = async () => {
  const res = await axios.get(`${API_BASE_URL}/order/stats`, {
    withCredentials: true,
    headers: authHeader(),
  });
  return res.data;
};


/** GET /order/status-logs với query: page, limit, sortBy, sortOrder, search, changed_by_role, order_id, changedAtFrom, changedAtTo */
const apiGetOrderStatusLogsList = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const query = params.toString();
  const url = `${API_BASE_URL}/order/status-logs${query ? `?${query}` : ""}`;
  const res = await axios.get(url, {
    withCredentials: true,
    headers: authHeader(),
  });
  return res.data;
};


// ===== SAGAS =====


// CREATE ORDER
function* orderCreateSaga(action) {
  try {
    const { selected_product_ids, receiverInfo, payment_method, icity, discountInfo } = action.payload;
    const res = yield call(
      apiCreateOrder,
      selected_product_ids,
      receiverInfo,
      payment_method,
      icity
    );


    if (res.success) {
      yield put(orderCreateSuccess(res));


      if (res.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }


      // VNPAY: nếu có discount thì áp discount trước (giống flow COD), lấy URL mới rồi mới redirect
      if (res.payment_url) {
        if (discountInfo && res.order_id) {
          const applyRes = yield call(
            apiApplyDiscount,
            res.order_id,
            discountInfo.discountId,
            discountInfo.orderValue
          );
          if (applyRes?.status !== "OK") {
            throw new Error(applyRes?.message || "Áp dụng mã giảm giá thất bại");
          }
          const urlRes = yield call(apiGetVnpayUrl, res.order_id);
          if (urlRes?.success && urlRes?.payUrl) {
            window.location.href = urlRes.payUrl;
            return;
          }
        }
        window.location.href = res.payment_url;
      } else {
        toast.success("Đặt hàng thành công");
      }
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderCreateFailure(msg));
    if (msg && String(msg).toLowerCase().includes("holding period has expired")) {
      toast.error("The holding period has expired. Please return to your cart and complete checkout again.");
    } else {
      toast.error(msg);
    }
  }
}


function* retryPaymentSaga(action) {
  try {
    const { order_id } = action.payload;


   const res = yield call(apiRetryPayment, order_id);


    if (res.success) {
      yield put(retryPaymentSuccess(res));


      // 🔥 VNPAY → redirect
      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        toast.success("Đặt hàng thành công");
      }
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderCreateFailure(msg));
    toast.error(msg);
  }
}


// CANCEL ORDER (CUSTOMER)
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


// CUSTOMER ORDER HISTORY
function* orderHistorySaga(action) {
  try {
    const res = yield call(apiGetMyOrders, action.payload || {});
    if (res.status === "OK") {
      yield put(orderHistorySuccess(res));
    } else {
      throw new Error(res.message || "Lấy lịch sử mua hàng thất bại");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderHistoryFailure(msg));
  }
}


// CUSTOMER ORDER DETAIL
function* orderDetailSaga(action) {
  try {
    const { order_id } = action.payload;
    const res = yield call(apiGetMyOrderById, order_id);
    if (res.status === "OK") {
      yield put(orderDetailSuccess(res.data));
    } else {
      throw new Error(res.message || "Lấy chi tiết đơn hàng thất bại");
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
      yield put(orderAdminListSuccess(res));
    } else {
      throw new Error(res.message || "Lấy danh sách đơn hàng thất bại");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderAdminListFailure(msg));
  }
}


// ADMIN UPDATE ORDER STATUS
function* orderAdminUpdateSaga(action) {
  try {
    const { order_id, status_name, note } = action.payload;
    const res = yield call(apiUpdateOrderAdmin, order_id, status_name, note);
    if (res.success) {
      yield put(orderAdminUpdateSuccess(res.message));
      toast.success(res.message);
    } else {
      throw new Error(res.message || "Cập nhật đơn hàng thất bại");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderAdminUpdateFailure(msg));
    toast.error(msg);
  }
}


// CONFIRM REFUND PAYMENT (admin/sales-staff: đơn REFUND + payment PENDING → xác nhận đã hoàn tiền)
function* confirmRefundPaymentSaga(action) {
  try {
    const { order_id } = action.payload;
    const res = yield call(apiConfirmRefundPayment, order_id);
    if (res.success) {
      yield put(orderAdminUpdateSuccess(res.message));
      toast.success(res.message || "Đã xác nhận hoàn tiền");
      yield put(orderAdminDetailRequest(order_id));
    } else {
      throw new Error(res.message || "Xác nhận hoàn tiền thất bại");
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
      yield put(orderAdminDetailSuccess(res.data));
    } else {
      throw new Error(res.message || "Lấy chi tiết đơn hàng thất bại");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderAdminDetailFailure(msg));
  }
}


// ADMIN ORDER STATS
function* orderAdminStatsSaga() {
  try {
    const res = yield call(apiGetAdminOrderStats);
    if (res.status === "OK") {
      yield put(orderAdminStatsSuccess(res.data));
    } else {
      throw new Error(res.message || "Lấy thống kê đơn hàng thất bại");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderAdminStatsFailure(msg));
  }
}


// ORDER STATUS LOGS (admin: list with filters, sort, pagination)
function* orderStatusLogsSaga(action) {
  try {
    const filters = action.payload || {};
    const res = yield call(apiGetOrderStatusLogsList, filters);
    if (res.status === "OK") {
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      const pagination = res.pagination || null;
      yield put(orderStatusLogsSuccess(data, pagination));
    } else {
      throw new Error(res.message || "Lấy lịch sử thay đổi trạng thái thất bại");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(orderStatusLogsFailure(msg));
  }
}


export default function* orderSaga() {
  yield takeLatest(ORDER_CREATE_REQUEST, orderCreateSaga);
  yield takeLatest(ORDER_CANCEL_REQUEST, orderCancelSaga);
  yield takeLatest(RETRY_PAYMENT_REQUEST, retryPaymentSaga);
  yield takeLatest(ORDER_HISTORY_REQUEST, orderHistorySaga);
  yield takeLatest(ORDER_DETAIL_REQUEST, orderDetailSaga);
  yield takeLatest(ORDER_ADMIN_LIST_REQUEST, orderAdminListSaga);
  yield takeLatest(ORDER_ADMIN_UPDATE_REQUEST, orderAdminUpdateSaga);
  yield takeLatest(ORDER_CONFIRM_REFUND_PAYMENT_REQUEST, confirmRefundPaymentSaga);
  yield takeLatest(ORDER_ADMIN_DETAIL_REQUEST, orderAdminDetailSaga);
  yield takeLatest(ORDER_ADMIN_STATS_REQUEST, orderAdminStatsSaga);
  yield takeLatest(ORDER_STATUS_LOGS_REQUEST, orderStatusLogsSaga);
}




