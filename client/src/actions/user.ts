import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: any;
  token: string;
}


export const userApi = createApi({
  reducerPath: "userApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3002/api/user/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).users.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registration: builder.mutation<any, RegisterRequest>({
      query: (body) => ({
        url: "register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<any, LoginRequest>({
      query: (body) => ({
        url: "login",
        method: "POST",
        body,
      }),
    }),
    auth: builder.query<AuthResponse, void>({
      query: () => "auth",
      providesTags: (result) => (result ? [{ type: "User", id: result.user.id }] : []),
    }),
  }),
});

export const { useAuthQuery } = userApi;
