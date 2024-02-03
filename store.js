import { configureStore } from "@reduxjs/toolkit";
import navReducer from "./slices/navSlice";
import driverReducer from "./slices/driverSlice";
import currentRideReducer from "./slices/currentRideSlice";
import personReducer from "./slices/personSlice";
import userReducer from "./slices/userSlice";
import vehicleReducer from "./slices/vehicleSlice";

export const store = configureStore({
  reducer: {
    nav: navReducer,
    driver: driverReducer,
    currentRide: currentRideReducer,
    person: personReducer,
    user: userReducer,
    vehicle: vehicleReducer,
  },
});