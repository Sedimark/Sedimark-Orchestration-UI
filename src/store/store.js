import {combineReducers, configureStore, applyMiddleware} from "@reduxjs/toolkit";
import nodeReducer from "../reducers/nodeSlice";
import {loadState, saveState} from "../utils/localStorage";


const persistedStore = loadState();
const reducers = combineReducers({
  node:nodeReducer
})
export const store = configureStore({reducer: nodeReducer, preloadedState:persistedStore});

store.subscribe(()=>{
  const currentState = store.getState();
  saveState(currentState);
})
