
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import tourReducer from "./slices/tourSlice";
import adminReducer from "./slices/adminSlice";
import operatorReducer from "./slices/operatorSlice";
import availabilityReducer from "./slices/availabilitySlice";
import bookingReducer from "./slices/bookingSlice";
import savedTourReducer from "./slices/savedTourSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tours: tourReducer,
    admin: adminReducer,
    operator: operatorReducer,
    availability: availabilityReducer,
    booking: bookingReducer,
    savedTours: savedTourReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
