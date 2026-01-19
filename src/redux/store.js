// store/index.js
import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import authReducer from "./reducers/authReducer";
import contactReducer from "./reducers/contactReducer";
import profileReducer from "./reducers/profileReducer";
import warehouseReducer from "./reducers/warehouseReducer";
import staffReducer from "./reducers/staffReducer";
import customerReducer from "./reducers/customerReducer";
import discountReducer from "./reducers/discountReducer";
import rootSaga from "./sagas/rootSaga";

const rootReducer = combineReducers({
  auth: authReducer,
  contact: contactReducer,
  profile: profileReducer,
  warehouse: warehouseReducer,
  staff: staffReducer,
  customer: customerReducer,
  discount: discountReducer,
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