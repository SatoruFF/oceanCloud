import { createSlice } from "@reduxjs/toolkit";

export interface fileInterface {
  files: [];
  currentDir: string | null | number;
}

const initialState: fileInterface = {
  files: [],
  currentDir: null,
};

export const fileSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    setDir: (state, action) => {
      state.currentDir = action.payload.dir
    },
    addNewFile: (state: any, action) => {
      state.files.push(action.payload);
    }
  },
});

export const { setFiles, setDir, addNewFile } = fileSlice.actions;
export default fileSlice.reducer;
