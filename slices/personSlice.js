import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  person: {},
};

export const personSlice = createSlice({
  name: "person",
  initialState,
  reducers: {
    setPerson: (state, action) => {
      state.person = action.payload;
    },
  },
});

export const { setPerson } = personSlice.actions;

// Selectors => To pull data
export const selectPerson = (state) => state.person.person;

export default personSlice.reducer;
