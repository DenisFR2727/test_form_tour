import { configureStore } from "@reduxjs/toolkit";
import tourReducer from "../components/form/tourSlice";

export const store = configureStore({
  reducer: tourReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
