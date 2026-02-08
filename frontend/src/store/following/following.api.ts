import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import { FollowingUsersResponse } from "./following.type";

export const followingApi = createApi({
  reducerPath: "followingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Following"],
  endpoints: (builder) => ({
    followUser: builder.mutation<{ following: boolean }, { userId: number }>({
      query: ({ userId }) => ({
        url: `api/following/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Following"],
    }),

    getFollowing: builder.query<boolean, { userId: number }>({
      query: ({ userId }) => ({
        url: `api/following/${userId}`,
        method: "GET",
      }),
      providesTags: ["Following"],
    }),

    getMyFollowings: builder.query<FollowingUsersResponse, void>({
      query: () => ({
        url: `api/following/followings`,
        method: "GET",
      }),
      providesTags: ["Following"],
    }),

    getMyFollowers: builder.query<FollowingUsersResponse, void>({
      query: () => ({
        url: `api/following/followers`,
        method: "GET",
      }),
      providesTags: ["Following"],
    }),
  }),
});

export const {
  useFollowUserMutation,
  useGetFollowingQuery,
  useGetMyFollowingsQuery,
  useGetMyFollowersQuery,
} = followingApi;
