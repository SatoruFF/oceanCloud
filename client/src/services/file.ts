import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const fileApi = createApi({
    reducerPath: 'fileApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3002/api/',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token")
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
              }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        getFiles: builder.query<any, any>({
            query: () => 'file',
        })
    })
})

export const { useGetFilesQuery } = fileApi;