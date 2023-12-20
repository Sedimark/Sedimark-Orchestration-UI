import {combineReducers, configureStore, applyMiddleware} from "@reduxjs/toolkit";
import nodeReducer from "../reducers/nodeSlice";
import {loadState, saveState} from "../utils/localStorage";


const persistedStore = loadState();
export const store = configureStore({reducer: nodeReducer}, persistedStore);

store.subscribe(()=>{
  const currentState = store.getState();
  saveState(currentState);
})
