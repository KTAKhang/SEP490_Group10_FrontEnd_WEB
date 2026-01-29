import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import contactSaga from "./contactSaga";
import profileSaga from "./profileSaga";
import cartSaga from "./cartSaga";
import checkoutSaga from "./checkoutSaga";
import orderSaga from "./orderSaga";
import newsSaga from "./newsSaga";
import shopSaga from "./shopSaga";
import staffSaga from "./staffSage";
import customerSaga from "./customerSaga";
import discountSaga from "./discountSaga";
import categorySaga from "./categorySaga";
import productSaga from "./productSaga";
import inventorySaga from "./inventorySaga";
import publicProductSaga from "./publicProductSaga";
import publicCategorySaga from "./publicCategorySaga";
import { productBatchSaga } from "./productBatchSaga";
import favoriteSaga from "./favoriteSaga";
import supplierSaga from "./supplierSaga";
import fruitBasketSaga from "./fruitBasketSaga";
import publicFruitBasketSaga from "./publicFruitBasketSaga";
import reviewSaga from "./reviewSaga";

export default function* rootSaga() {
  try {
    yield all([
      authSaga(),
      contactSaga(),
      profileSaga(),
      cartSaga(),
      checkoutSaga(),
      orderSaga(),
      newsSaga(),
      shopSaga(),
      staffSaga(),
      customerSaga(),
      discountSaga(),
      categorySaga(),
      productSaga(),
      inventorySaga(),
      publicProductSaga(),
      publicCategorySaga(),
      publicFruitBasketSaga(),
      productBatchSaga(),
      favoriteSaga(),
      supplierSaga(),
      fruitBasketSaga(),
      reviewSaga(),
    ]);
  } catch (error) {
    console.error("🔴 rootSaga ERROR:", error);
  }

}
