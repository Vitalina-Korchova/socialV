import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import { CommentRequest, CommentResponse, PaginatedCommentsResponse } from "./comment.type";

export const commentApi = createApi({
    reducerPath: "commentApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Comment"],
    endpoints: (builder) => ({
        getAllComments: builder.query<
            PaginatedCommentsResponse,
            { postId: number; page?: number; page_size?: number }
        >({
            query: ({ postId, page = 1, page_size = 10 }) => ({
                url: `api/comments/post/${postId}`,
                method: "GET",
                params: { page, page_size },
            }),
            providesTags: ["Comment"],
        }),

        createComment: builder.mutation<CommentResponse, { userId: number; dto: CommentRequest }>({
            query: ({ userId, dto }) => ({
                url: `api/comments/user/${userId}`,
                method: "POST",
                body: dto,
            }),
            invalidatesTags: ["Comment"],
        }),

        deleteComment: builder.mutation<void, number>({
            query: (commentId) => ({
                url: `api/comments/${commentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Comment"],
        }),
    }),
});

export const {
    useGetAllCommentsQuery,
    useCreateCommentMutation,
    useDeleteCommentMutation,
} = commentApi;
