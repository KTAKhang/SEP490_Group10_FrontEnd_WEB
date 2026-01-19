// store/index.js
import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import authReducer from "./reducers/authReducer";
import contactReducer from "./reducers/contactReducer";
import profileReducer from "./reducers/profileReducer";
import cartReducer from "./reducers/cartReducer";
import checkoutReducer from "./reducers/checkoutReducer";
import orderReducer from "./reducers/orderReducer";
import newsReducer from "./reducers/newsReducer";
import shopReducer from "./reducers/shopReducer";
import staffReducer from "./reducers/staffReducer";
import customerReducer from "./reducers/customerReducer";
import discountReducer from "./reducers/discountReducer";
import categoryReducer from "./reducers/categoryReducer";
import productReducer from "./reducers/productReducer";
import inventoryReducer from "./reducers/inventoryReducer";
import publicProductReducer from "./reducers/publicProductReducer";
import publicCategoryReducer from "./reducers/publicCategoryReducer";
import productBatchReducer from "./reducers/productBatchReducer";
import favoriteReducer from "./reducers/favoriteReducer";
import supplierReducer from "./reducers/supplierReducer";
import rootSaga from "./sagas/rootSaga";

const rootReducer = combineReducers({
  auth: authReducer,
  contact: contactReducer,
  profile: profileReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
  order: orderReducer,
  news: newsReducer,
  shop: shopReducer,
  staff: staffReducer,
  customer: customerReducer,
  discount: discountReducer,
  category: categoryReducer,
  product: productReducer,
  inventory: inventoryReducer,
  publicProduct: publicProductReducer,
  publicCategory: publicCategoryReducer,
  productBatch: productBatchReducer,
  favorite: favoriteReducer,
  supplier: supplierReducer,
});

const sagaMiddleware = createSagaMiddleware();

// Enable Redux DevTools in development if available
const composeEnhancers =
  (import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  ((f) => f);

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(rootSaga);

export default store;