import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import { PaginatedPostResponse, PostResponse } from "./post.type";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getAllPosts: builder.query<
      PaginatedPostResponse,
      { type: string; page?: number; page_size?: number }
    >({
      query: ({ type, page, page_size }) => ({
        url: "api/posts",
        method: "GET",
        params: { type, page, page_size },
      }),
      providesTags: ["Post"],
      keepUnusedDataFor: 0,
    }),
    getPostById: builder.query<PostResponse, { postId: number }>({
      query: ({ postId }) => ({
        url: `api/posts/${postId}`,
        method: "GET",
      }),
      providesTags: ["Post"],
      keepUnusedDataFor: 0,
    }),
    getPostByUserId: builder.query<
      PaginatedPostResponse,
      { userId: number; page?: number; page_size?: number }
    >({
      query: ({ userId, page, page_size }) => ({
        url: `api/posts/user/${userId}`,
        method: "GET",
        params: { page, page_size },
      }),
      providesTags: ["Post"],
      keepUnusedDataFor: 0,
    }),
    createPost: builder.mutation<PostResponse, FormData>({
      query: (body) => ({
        url: "api/posts",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Post"],
    }),
    updatePost: builder.mutation<PostResponse, { id: number; body: FormData }>({
      query: ({ id, body }) => ({
        url: `api/posts/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Post"],
    }),
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `api/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
    likePost: builder.mutation<{ liked: boolean }, { postId: number }>({
      query: ({ postId }) => ({
        url: `api/likes/${postId}`,
        method: "POST",
      }),
    }),
    repostPost: builder.mutation<{ repost: boolean }, { postId: number }>({
      query: ({ postId }) => ({
        url: `api/reposts/${postId}`,
        method: "POST",
      }),
    }),
    savePost: builder.mutation<{ saved_post: boolean }, { postId: number }>({
      query: ({ postId }) => ({
        url: `api/saved-post/${postId}`,
        method: "POST",
      }),
    }),
    getFeed: builder.query<
      PaginatedPostResponse,
      { search?: string; page?: number; page_size?: number }
    >({
      query: ({ search, page, page_size }) => ({
        url: "api/feed",
        method: "GET",
        params: { search, page, page_size },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    generateFeed: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "api/feed/generate",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useGetPostByUserIdQuery,
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
  useGetFeedQuery,
  useGenerateFeedMutation,
} = postApi;
