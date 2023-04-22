import { createSlice } from "@reduxjs/toolkit";

export interface fileInterface {
  files: [];
  currentDir: string | null;
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
      state.files = action.payload.file;
    },
    setDir: (state, action) => {
      state.currentDir = action.payload.dir
    }
  },
});

export const { setFiles, setDir } = fileSlice.actions;
export default fileSlice.reducer;
