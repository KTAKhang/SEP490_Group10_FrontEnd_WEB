import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { toast } from "react-toastify";

import {
  CART_FETCH_REQUEST,
  fetchCartSuccess,
  fetchCartFailure,
  CART_ADD_ITEM_REQUEST,
  addItemToCartSuccess,
  addItemToCartFailure,
  CART_UPDATE_ITEM_REQUEST,
  updateCartItemSuccess,
  updateCartItemFailure,
  CART_REMOVE_ITEM_REQUEST,
  removeCartItemSuccess,
  removeCartItemFailure,
  SHIPPING_CHECK_REQUEST,
  shippingCheckSuccess,
  shippingCheckFailure,
} from "../actions/cartActions";

const API_BASE_URL = "http://localhost:3001";

// ===== AUTH HEADER =====
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ===== API =====
const apiFetchCart = async () => {
  const res = await axios.get(`${API_BASE_URL}/cart`, {
    withCredentials: true,
    headers: authHeader(),
  });
  return res.data;
};

const apiAddItem = async (product_id, quantity) => {
  const res = await axios.post(
    `${API_BASE_URL}/cart/add`,
    { product_id, quantity },
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};

const apiUpdateItem = async (product_id, quantity) => {
  const res = await axios.put(
    `${API_BASE_URL}/cart/update`,
    {
      product_id,
      quantity, // ✅ FIX: gửi đúng key backend cần
    },
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};

const apiRemoveItem = async (product_ids) => {
  const res = await axios.delete(`${API_BASE_URL}/cart/remove`, {
    data: { product_ids },
    withCredentials: true,
    headers: authHeader(),
  });
  return res.data;
};

const apiCheckShipping = async (selected_product_ids, city) => {
  const res = await axios.post(
    `${API_BASE_URL}/shipping/check`,
    { selected_product_ids, city },
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};

// ===== SAGAS =====
function* fetchCartSaga() {
  try {
    const res = yield call(apiFetchCart);

    // ✅ unwrap data
    yield put(fetchCartSuccess(res.data));
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(fetchCartFailure(msg));
  }
}

function* addItemSaga(action) {
  try {
    const { product_id, quantity } = action.payload;

    if (!quantity || quantity < 1) {
      throw new Error("Số lượng phải >= 1");
    }

    const res = yield call(apiAddItem, product_id, quantity);

    yield put(addItemToCartSuccess(res.message));
    toast.success(res.message);

    yield put({ type: CART_FETCH_REQUEST });
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(addItemToCartFailure(msg));
    toast.error(msg);
  }
}

function* updateItemSaga(action) {
  try {
    const { product_id, quantity } = action.payload;

    if (!quantity || quantity < 1) {
      throw new Error("Số lượng phải >= 1");
    }

    const res = yield call(apiUpdateItem, product_id, quantity);

    yield put(updateCartItemSuccess(res));
    toast.success(res.message);

    yield put({ type: CART_FETCH_REQUEST });
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(updateCartItemFailure(msg));
    toast.error(msg);
  }
}

function* removeItemSaga(action) {
  try {
    const { product_ids } = action.payload;
    const res = yield call(apiRemoveItem, product_ids);

    if (res.status === "OK") {
      yield put(removeCartItemSuccess(res));
      toast.success(res.message);

      yield put({ type: CART_FETCH_REQUEST });
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(removeCartItemFailure(msg));
    toast.error(msg);
  }
}

function* checkShippingSaga(action) {
  try {
    const { selected_product_ids, city } = action.payload;

    if (!city) throw new Error("Please select a province/city");

    if (!Array.isArray(selected_product_ids) || selected_product_ids.length === 0)
      throw new Error("Please select at least one product.");

    const res = yield call(apiCheckShipping, selected_product_ids, city);

    if (res.status === "OK") {
      yield put(shippingCheckSuccess(res.data));
      // toast.success(res.message);
    } else {
      throw new Error(res.message || "Failed to calculate shipping fee");
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(shippingCheckFailure(msg));
    toast.error(msg);
  }
}

export default function* cartSaga() {
  yield takeLatest(CART_FETCH_REQUEST, fetchCartSaga);
  yield takeLatest(CART_ADD_ITEM_REQUEST, addItemSaga);
  yield takeLatest(CART_UPDATE_ITEM_REQUEST, updateItemSaga);
  yield takeLatest(CART_REMOVE_ITEM_REQUEST, removeItemSaga);
  yield takeLatest(SHIPPING_CHECK_REQUEST, checkShippingSaga);
}
