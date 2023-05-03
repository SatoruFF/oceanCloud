import { createSlice } from "@reduxjs/toolkit";

export interface fileInterface {
  files: [];
  currentDir: null | number | any;
  dirStack: number[] | [];
}

const initialState: fileInterface = {
  files: [],
  currentDir: null,
  dirStack: [],
};

export const fileSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    setDir: (state, action) => {
      state.currentDir = action.payload
    },
    addNewFile: (state: any, action) => {
      state.files.push(action.payload);
    },
    pushToStack: (state: any, action) => {
      state.dirStack.push(action.payload);
    },
    popToStack: (state: any) => {
      state.currentDir = state.dirStack.pop()
    },
  },
});

export const { setFiles, setDir, addNewFile, pushToStack, popToStack } = fileSlice.actions;
export default fileSlice.reducer;
