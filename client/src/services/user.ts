import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Variables } from "../config/localVariables";

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
    baseUrl: Variables.User_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
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
    auth: builder.query<any, void>({
      query: () => "auth",
    }),
    changeInfo: builder.mutation<any, any>({
      query: (body) => ({
        url: 'userchange',
        method: "PATCH",
        body
      })
    }),
  }),
});

export const { useAuthQuery, useChangeInfoMutation } = userApi;
