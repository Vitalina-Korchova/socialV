import { baseQueryWithReauth } from "../baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { UserResponse, UserRequestUpdate } from "./user.type";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getMe: builder.query<UserResponse, void>({
      query: () => ({
        url: "api/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<UserResponse, number>({
      query: (id) => ({
        url: `api/user/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation<UserResponse, UserRequestUpdate>({
      query: (dto) => ({
        url: "api/me",
        method: "PUT",
        body: dto,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetMeQuery, useUpdateUserMutation, useGetUserByIdQuery } =
  userApi;
