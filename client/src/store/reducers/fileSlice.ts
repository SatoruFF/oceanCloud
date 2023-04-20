import { createSlice } from "@reduxjs/toolkit";

export interface fileInterface {}

const initialState: fileInterface = {};

export const fileSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    fileReducer: (state) => {},
  },
});

export const { fileReducer } = fileSlice.actions;
export default fileSlice.reducer;
