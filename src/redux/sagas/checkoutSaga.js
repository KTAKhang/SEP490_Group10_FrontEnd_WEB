import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { toast } from "react-toastify";

import {
  CHECKOUT_HOLD_REQUEST,
  CHECKOUT_CANCEL_REQUEST,
  checkoutHoldSuccess,
  checkoutHoldFailure,
  checkoutCancelSuccess,
  checkoutCancelFailure,
} from "../actions/checkoutActions";

const API_BASE_URL = "http://localhost:3001";

// ===== AUTH HEADER =====
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ===== API =====
const apiCheckoutHold = async (selected_product_ids, checkout_session_id) => {
  const res = await axios.post(
    `${API_BASE_URL}/checkout/hold`,
    { selected_product_ids, checkout_session_id },
    {
      withCredentials: true,
      headers: authHeader(),
    },
  );
  return res.data;
};

const apiCheckoutCancel = async (checkout_session_id) => {
  const res = await axios.post(
    `${API_BASE_URL}/checkout/cancel`,
    { checkout_session_id },
    {
      withCredentials: true,
      headers: authHeader(),
    },
  );
  return res.data;
};

// ===== SAGAS =====
function* checkoutHoldSaga(action) {
  try {
    const { selected_product_ids, checkout_session_id } = action.payload;

    if (!selected_product_ids || selected_product_ids.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một sản phẩm");
    }

    const res = yield call(
      apiCheckoutHold,
      selected_product_ids,
      checkout_session_id,
    );

    if (res.status === "OK") {

      // ✅ CHỈ ghi session do BACKEND trả về
      if (res.checkout_session_id) {
        localStorage.setItem(
          "checkout_session_id",
          res.checkout_session_id
        );
      }

      yield put(checkoutHoldSuccess(res));
      toast.success(res.message);
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(checkoutHoldFailure(msg));
    toast.error(msg);
  }
}

function* checkoutCancelSaga(action) {
  try {
    const { checkout_session_id } = action.payload;

    const res = yield call(apiCheckoutCancel, checkout_session_id);

    if (res.status === "OK") {

      // ✅ CLEAR LOCAL Ở SAGA
      localStorage.removeItem("checkout_session_id");

      yield put(checkoutCancelSuccess(res.message));
      toast.success(res.message);
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(checkoutCancelFailure(msg));
    toast.error(msg);
  }
}


export default function* checkoutSaga() {
  yield takeLatest(CHECKOUT_HOLD_REQUEST, checkoutHoldSaga);
  yield takeLatest(CHECKOUT_CANCEL_REQUEST, checkoutCancelSaga);
}
