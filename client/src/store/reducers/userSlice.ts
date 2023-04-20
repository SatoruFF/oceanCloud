import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UserInterface {
  currentUser: any;
  token: string | null
  isAuth: boolean;
}

const initialState: UserInterface = {
  currentUser: {},
  token: '',
  isAuth: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: any) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isAuth = true;
      localStorage.setItem('token', action.payload.token);
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
