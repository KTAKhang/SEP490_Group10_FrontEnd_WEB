import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import contactSaga from "./contactSaga";
import profileSaga from "./profileSaga";
import warehouseSaga from "./warehouseSaga";
import staffSaga from "./staffSage";
import customerSaga from "./customerSaga";
import discountSaga from "./discountSaga";


export default function* rootSaga() {
  try {
    yield all([
      authSaga(),
      contactSaga(),
      profileSaga(),
      warehouseSaga(),
      staffSaga(),
      customerSaga(),
      discountSaga(),
    ]);
  } catch (error) {
    console.error("🔴 rootSaga ERROR:", error);
  }

}
