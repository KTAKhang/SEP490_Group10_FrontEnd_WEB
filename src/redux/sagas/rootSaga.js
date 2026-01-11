import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import profileSaga from "./profileSaga";

export default function* rootSaga() {
  try {
    yield all([
      authSaga(),
      profileSaga(),
    ]);
  } catch (error) {
    console.error("🔴 rootSaga ERROR:", error);
  }

}
