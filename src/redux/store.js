// store/index.js
import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import authReducer from "./reducers/authReducer";
import contactReducer from "./reducers/contactReducer";
import profileReducer from "./reducers/profileReducer";
import categoryReducer from "./reducers/categoryReducer";
import productReducer from "./reducers/productReducer";
import inventoryReducer from "./reducers/inventoryReducer";
import publicProductReducer from "./reducers/publicProductReducer";
import publicCategoryReducer from "./reducers/publicCategoryReducer";
import productBatchReducer from "./reducers/productBatchReducer";
import favoriteReducer from "./reducers/favoriteReducer";
import rootSaga from "./sagas/rootSaga";

const rootReducer = combineReducers({
  auth: authReducer,
  contact: contactReducer,
  profile: profileReducer,
  category: categoryReducer,
  product: productReducer,
  inventory: inventoryReducer,
  publicProduct: publicProductReducer,
  publicCategory: publicCategoryReducer,
  productBatch: productBatchReducer,
  favorite: favoriteReducer,
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