import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import { NotificationsDto, PaginatedNotificationsResponse } from "./notification.type";

export const notificationsApi = createApi({
    reducerPath: "notificationsApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Notifications"],
    endpoints: (builder) => ({
        getNotifications: builder.query<
            PaginatedNotificationsResponse,
            { page?: number; page_size?: number }
        >({
            query: ({ page = 1, page_size = 10 }) => ({
                url: "api/notifications",
                params: { page, page_size },
            }),
            providesTags: ["Notifications"],
        }),
        getUnreadCount: builder.query<{ count: number }, void>({
            query: () => "api/notifications/unread-count",
            providesTags: ["Notifications"],
        }),
        markAsRead: builder.mutation<NotificationsDto, number>({
            query: (id) => ({
                url: `api/notifications/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["Notifications"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
} = notificationsApi;
