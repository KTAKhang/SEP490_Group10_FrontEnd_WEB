import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { toast } from "react-toastify";

import {
  ORDER_CREATE_REQUEST,
  ORDER_CANCEL_REQUEST,
  orderCreateSuccess,
  orderCreateFailure,
  orderCancelSuccess,
  orderCancelFailure,
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

export default function* orderSaga() {
  yield takeLatest(ORDER_CREATE_REQUEST, orderCreateSaga);
  yield takeLatest(ORDER_CANCEL_REQUEST, orderCancelSaga);
}
