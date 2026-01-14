import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginRequest, UserMe } from "./auth.type";
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/`,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    loginUser: builder.mutation<{ message: string }, LoginRequest>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body: body,
      }),
    }),
    getMe: builder.query<UserMe, void>({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginUserMutation, useGetMeQuery } = authApi;
