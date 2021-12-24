import { createStore, combineReducers } from "redux";
import { persistStore, persistReducer,createTransform} from "redux-persist";
import AsyncStorage from "redux-persist/lib/storage";
import {parse, stringify, toJSON, fromJSON} from 'flatted'
import todoReducer from '../pages/reducer/index'

export const transformCircular = createTransform(
  (inboundState, key) => stringify(inboundState),
  (outboundState, key) => parse(outboundState),
)
function configureStore(initialState = {}) {
  const reducer = combineReducers({
    app: todoReducer,
   
  });

  const store = createStore(persistReducer({
    key: "root",
    debug: true,
    storage: AsyncStorage,
    transforms: [transformCircular]
  }, reducer), initialState);

  console.log("initialState", store.getState());

  const persistor = persistStore(store, null, () => {
    // if you want to get restoredState
    console.log("restoredState", store.getState());
  });

  return { store, persistor };
}

export default configureStore;
