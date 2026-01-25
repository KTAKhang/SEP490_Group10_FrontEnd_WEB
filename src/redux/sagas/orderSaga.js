import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { toast } from "react-toastify";

import {
  ORDER_CREATE_REQUEST,
  ORDER_CANCEL_REQUEST,
  ORDER_HISTORY_REQUEST,
  ORDER_DETAIL_REQUEST,
  ORDER_ADMIN_LIST_REQUEST,
  ORDER_ADMIN_UPDATE_REQUEST,
  ORDER_ADMIN_DETAIL_REQUEST,
  ORDER_ADMIN_STATS_REQUEST,
  orderCreateSuccess,
  orderCreateFailure,
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
  orderAdminDetailSuccess,
  orderAdminDetailFailure,
  orderAdminStatsSuccess,
  orderAdminStatsFailure,
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
  payment_method
) => {
  const res = await axios.post(
    `${API_BASE_URL}/order/create`,
    { selected_product_ids, receiverInfo, payment_method },
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

// ===== SAGAS =====

// CREATE ORDER
function* orderCreateSaga(action) {
  try {
    const { selected_product_ids, receiverInfo, payment_method } =
      action.payload;

    const res = yield call(
      apiCreateOrder,
      selected_product_ids,
      receiverInfo,
      payment_method
    );

    if (res.success) {
      yield put(orderCreateSuccess(res));

       if (res.redirect_url) {
        window.location.href = res.redirect_url;
      } else {
        toast.success("Đặt hàng thành công");
      }

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

export default function* orderSaga() {
  yield takeLatest(ORDER_CREATE_REQUEST, orderCreateSaga);
  yield takeLatest(ORDER_CANCEL_REQUEST, orderCancelSaga);
  yield takeLatest(ORDER_HISTORY_REQUEST, orderHistorySaga);
  yield takeLatest(ORDER_DETAIL_REQUEST, orderDetailSaga);
  yield takeLatest(ORDER_ADMIN_LIST_REQUEST, orderAdminListSaga);
  yield takeLatest(ORDER_ADMIN_UPDATE_REQUEST, orderAdminUpdateSaga);
  yield takeLatest(ORDER_ADMIN_DETAIL_REQUEST, orderAdminDetailSaga);
  yield takeLatest(ORDER_ADMIN_STATS_REQUEST, orderAdminStatsSaga);
}
