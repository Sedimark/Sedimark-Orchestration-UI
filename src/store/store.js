import {configureStore} from "@reduxjs/toolkit";
import nodeReducer from "../reducers/nodeSlice";

export const store = configureStore({
    reducer:nodeReducer,
});
