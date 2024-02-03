import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    dateRegistered: null,
    email: null,
    name: null,
    language: null,
    phone: null,
    authID: null,
    otpDate: null,
    otpCode: null,
    password: null,
    signedIn: false,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;

// Selectors => To pull data
export const selectUser = (state) => state.user.user;

export default userSlice.reducer;
