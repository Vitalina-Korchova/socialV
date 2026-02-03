import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export const likeRepostSavedpostApi = createApi({
  reducerPath: "like-repost-savedpostApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Liked-Post", "Repost-Post", "Saved-Post"],
  endpoints: (builder) => ({
    likePost: builder.mutation<{ liked: boolean }, { postId: number }>({
      query: ({ postId }) => ({
        url: `api/likes/${postId}`,
        method: "POST",
      }),
      invalidatesTags: ["Liked-Post"],
    }),
    repostPost: builder.mutation<{ repost: boolean }, { postId: number }>({
      query: ({ postId }) => ({
        url: `api/reposts/${postId}`,
        method: "POST",
      }),
      invalidatesTags: ["Repost-Post"],
    }),
    savePost: builder.mutation<{ saved_post: boolean }, { postId: number }>({
      query: ({ postId }) => ({
        url: `api/saved-post/${postId}`,
        method: "POST",
      }),
      invalidatesTags: ["Saved-Post"],
    }),
  }),
});

export const {
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
} = likeRepostSavedpostApi;
