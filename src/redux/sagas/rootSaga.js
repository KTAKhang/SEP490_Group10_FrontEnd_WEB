import { all } from "redux-saga/effects";
import authSaga from "./authSaga";


export default function* rootSaga() {
  try {
    yield all([
      authSaga(),

    ]);
  } catch (error) {
    console.error("🔴 rootSaga ERROR:", error);
  }

}
