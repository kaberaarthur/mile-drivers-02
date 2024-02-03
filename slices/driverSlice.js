import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  driver: {
    driverId: null,
    driverName: null,
    driverPhone: null,
    carMake: null,
    carModel: null,
    licensePlate: null,
    rating: null,
    isAvailable: null,
  },
};

export const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    setDriver: (state, action) => {
      state.driver = action.payload;
    },
  },
});

export const { setDriver } = driverSlice.actions;

// Selector => To pull driver data
export const selectDriver = (state) => state.driver.driver;

export default driverSlice.reducer;
