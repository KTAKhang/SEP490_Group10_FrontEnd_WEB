import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import contactSaga from "./contactSaga";
import profileSaga from "./profileSaga";
import categorySaga from "./categorySaga";
import productSaga from "./productSaga";
import inventorySaga from "./inventorySaga";
import publicProductSaga from "./publicProductSaga";
import publicCategorySaga from "./publicCategorySaga";
import { productBatchSaga } from "./productBatchSaga";
import favoriteSaga from "./favoriteSaga";
import supplierSaga from "./supplierSaga";


export default function* rootSaga() {
  try {
    yield all([
      authSaga(),
      contactSaga(),
      profileSaga(),
      categorySaga(),
      productSaga(),
      inventorySaga(),
      publicProductSaga(),
      publicCategorySaga(),
      productBatchSaga(),
      favoriteSaga(),
      supplierSaga(),
    ]);
  } catch (error) {
    console.error("🔴 rootSaga ERROR:", error);
  }

}
