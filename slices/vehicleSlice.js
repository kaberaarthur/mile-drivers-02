import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  vehicle: {},
};

export const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setVehicle: (state, action) => {
      state.vehicle = action.payload;
    },
  },
});

export const { setVehicle } = vehicleSlice.actions;

// Selectors => To pull data
export const selectVehicle = (state) => state.vehicle.vehicle;

export default vehicleSlice.reducer;
