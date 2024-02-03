import { createSlice } from "@reduxjs/toolkit";
import firebase from "firebase/compat/app";

const initialState = {
  currentRide: {},
};

export const currentRideSlice = createSlice({
  name: "currentRide",
  initialState,
  reducers: {
    setCurrentRide: (state, action) => {
      const ride = action.payload;

      // Check if dateCreated is a Firebase timestamp and convert it to a Date
      if (ride.dateCreated instanceof firebase.firestore.Timestamp) {
        ride.dateCreated = ride.dateCreated.toDate();
      }

      state.currentRide = ride;
    },
  },
});

export const { setCurrentRide } = currentRideSlice.actions;

// Selector => To pull current ride data
export const selectCurrentRide = (state) => state.currentRide.currentRide;

export default currentRideSlice.reducer;
