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

export const userApi = createApi({
  reducerPath: "userApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3002/api/user/",
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
  }),
});
