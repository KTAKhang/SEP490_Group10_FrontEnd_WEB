// store/index.js
import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import authReducer from "./reducers/authReducer";
import contactReducer from "./reducers/contactReducer";
import profileReducer from "./reducers/profileReducer";
import warehouseReducer from "./reducers/warehouseReducer";
import cartReducer from "./reducers/cartReducer";
import checkoutReducer from "./reducers/checkoutReducer";
import orderReducer from "./reducers/orderReducer";
import rootSaga from "./sagas/rootSaga";

const rootReducer = combineReducers({
  auth: authReducer,
  contact: contactReducer,
  profile: profileReducer,
  warehouse: warehouseReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
  order: orderReducer,
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