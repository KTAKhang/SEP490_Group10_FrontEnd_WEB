import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import contactSaga from "./contactSaga";
import profileSaga from "./profileSaga";
import warehouseSaga from "./warehouseSaga";
import cartSaga from "./cartSaga";
import checkoutSaga from "./checkoutSaga";
import orderSaga from "./orderSaga";
export default function* rootSaga() {
  try {
    yield all([
      authSaga(),
      contactSaga(),
      profileSaga(),
      warehouseSaga(),
      cartSaga(),
      checkoutSaga(),
      orderSaga()
    ]);
  } catch (error) {
    console.error("🔴 rootSaga ERROR:", error);
  }

}
