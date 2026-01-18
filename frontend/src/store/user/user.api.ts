import { baseQueryWithReauth } from "../baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { User, UserRequestUpdate } from "./user.type";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => ({
        url: "api/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation<User, { id: number; dto: UserRequestUpdate }>({
      query: ({ id, dto }) => ({
        url: `api/user/${id}`,
        method: "PUT",
        body: dto,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetMeQuery, useUpdateUserMutation } = userApi;
