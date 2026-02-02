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
  CART_ADD_BASKET_REQUEST,
  addFruitBasketToCartSuccess,
  addFruitBasketToCartFailure,
  CART_UPDATE_ITEM_REQUEST,
  updateCartItemSuccess,
  updateCartItemFailure,
  CART_REMOVE_ITEM_REQUEST,
  removeCartItemSuccess,
  removeCartItemFailure,
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

const apiUpdateItem = async (payload) => {
  const body = {};
  if (payload.product_id != null) body.product_id = payload.product_id;
  if (payload.fruit_basket_id != null) body.fruit_basket_id = payload.fruit_basket_id;
  body.quantity = payload.quantity;
  const res = await axios.put(
    `${API_BASE_URL}/cart/update`,
    body,
    {
      withCredentials: true,
      headers: authHeader(),
    }
  );
  return res.data;
};

const apiRemoveItem = async (product_ids, fruit_basket_ids) => {
  const res = await axios.delete(`${API_BASE_URL}/cart/remove`, {
    data: { product_ids: product_ids || [], fruit_basket_ids: fruit_basket_ids || [] },
    withCredentials: true,
    headers: authHeader(),
  });
  return res.data;
};

const apiAddFruitBasket = async (fruit_basket_id) => {
  const res = await axios.post(
    `${API_BASE_URL}/cart/add-basket`,
    { fruit_basket_id },
    { withCredentials: true, headers: authHeader() }
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
    const payload = action.payload;
    const quantity = Number(payload.quantity);
    if (payload.product_id == null && payload.fruit_basket_id == null) {
      throw new Error("Cần truyền product_id hoặc fruit_basket_id");
    }
    if (quantity < 0 || !Number.isInteger(quantity)) {
      throw new Error("Số lượng phải là số nguyên không âm");
    }

    const res = yield call(apiUpdateItem, payload);

    yield put(updateCartItemSuccess(res));
    toast.success(res.message || "Cập nhật giỏ hàng thành công");

    yield put({ type: CART_FETCH_REQUEST });
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(updateCartItemFailure(msg));
    toast.error(msg);
  }
}

function* removeItemSaga(action) {
  try {
    const { product_ids, fruit_basket_ids } = action.payload;
    const res = yield call(apiRemoveItem, product_ids || [], fruit_basket_ids || []);

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

function* addFruitBasketSaga(action) {
  try {
    const { fruit_basket_id } = action.payload;
    const res = yield call(apiAddFruitBasket, fruit_basket_id);
    yield put(addFruitBasketToCartSuccess(res.message));
    toast.success(res.message);
    yield put({ type: CART_FETCH_REQUEST });
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(addFruitBasketToCartFailure(msg));
    toast.error(msg);
  }
}

export default function* cartSaga() {
  yield takeLatest(CART_FETCH_REQUEST, fetchCartSaga);
  yield takeLatest(CART_ADD_ITEM_REQUEST, addItemSaga);
  yield takeLatest(CART_ADD_BASKET_REQUEST, addFruitBasketSaga);
  yield takeLatest(CART_UPDATE_ITEM_REQUEST, updateItemSaga);
  yield takeLatest(CART_REMOVE_ITEM_REQUEST, removeItemSaga);
}
