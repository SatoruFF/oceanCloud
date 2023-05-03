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
        createDir: builder.mutation<any, any>({
            query: (body) => ({
                url: "file",
                method: "POST",
                body,
            })
        }),
        downloadFile: builder.mutation<any, any>({
            query: (file) => ({
                url: `file/download?=${file.id}`,
                method: "POST",
                file,
            })
        }),
        getFiles: builder.query<any, any>({
            query: (dirId: any) => `file${dirId ? '?parent='+String(dirId) : ''}`,
        })
    }),

})

export const { useGetFilesQuery, useCreateDirMutation, useDownloadFileMutation } = fileApi;