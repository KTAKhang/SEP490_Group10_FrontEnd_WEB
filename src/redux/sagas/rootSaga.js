import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import contactSaga from "./contactSaga";
import profileSaga from "./profileSaga";
import warehouseSaga from "./warehouseSaga";


export default function* rootSaga() {
  try {
    yield all([
      authSaga(),
      contactSaga(),
      profileSaga(),
      warehouseSaga(),
    ]);
  } catch (error) {
    console.error("🔴 rootSaga ERROR:", error);
  }

}
