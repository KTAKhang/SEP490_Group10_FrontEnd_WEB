import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";

import {
  CHECKOUT_HOLD_REQUEST,
  CHECKOUT_CANCEL_REQUEST,
  checkoutHoldSuccess,
  checkoutHoldFailure,
  checkoutCancelSuccess,
  checkoutCancelFailure,
} from "../actions/checkoutActions";

// ===== API =====

const apiCheckoutHold = async (selected_product_ids, checkout_session_id) => {
  const res = await apiClient.post("/checkout/hold", {
    selected_product_ids,
    checkout_session_id,
  });
  return res.data;
};

const apiCheckoutCancel = async (checkout_session_id) => {
  const res = await apiClient.post("/checkout/cancel", {
    checkout_session_id,
  });
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
      checkout_session_id
    );

    if (res.status === "OK") {

      // lưu session do backend trả
      if (res.checkout_session_id) {
        localStorage.setItem("checkout_session_id", res.checkout_session_id);
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

      // clear session
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

// ===== WATCHER =====

export default function* checkoutSaga() {
  yield takeLatest(CHECKOUT_HOLD_REQUEST, checkoutHoldSaga);
  yield takeLatest(CHECKOUT_CANCEL_REQUEST, checkoutCancelSaga);
}