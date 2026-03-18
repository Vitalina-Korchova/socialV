import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import { getSocket } from "../../utils/socket";
import { Chat, PaginatedChatsResponse, PaginatedMessagesResponse, Message, SendMessageDto } from "./chat.type";
import { userApi } from "../user/user.api";
import { RootState } from "../store";

export const chatApi = createApi({
    reducerPath: "chatApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Chat", "Message"],
    endpoints: (builder) => ({
        getAllChats: builder.query<
            PaginatedChatsResponse,
            { page?: number; page_size?: number }
        >({
            query: ({ page, page_size }) => ({
                url: "api/chats",
                method: "GET",
                params: { page, page_size },
            }),
            providesTags: ["Chat"],
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                const socket = getSocket();
                try {
                    await cacheDataLoaded;

                    socket.on("new_message", (message: Message) => {
                        updateCachedData((draft) => {
                            const chatIndex = draft.data.findIndex((c) => c.id === message.chat_id);
                            if (chatIndex !== -1) {
                                const chat = draft.data[chatIndex];
                                chat.last_message = {
                                    id: message.id,
                                    text_content: message.text_content,
                                    sender_id: message.sender_id,
                                    is_read: message.is_read,
                                    created_at: message.created_at,
                                };
                                // Move chat to top of list
                                draft.data.splice(chatIndex, 1);
                                draft.data.unshift(chat);
                            }
                        });
                    });

                    socket.on("messages_read", (markedMessages: { id: number; chat_id: number; is_read: boolean }[]) => {
                        updateCachedData((draft) => {
                            markedMessages.forEach((mm) => {
                                const chat = draft.data.find((c) => c.id === mm.chat_id);
                                if (chat && chat.last_message && chat.last_message.id === mm.id) {
                                    chat.last_message.is_read = true;
                                }
                            });
                        });
                    });
                } catch {
                    // no-op
                }
                await cacheEntryRemoved;
                socket.off("new_message");
                socket.off("messages_read");
            },
        }),
        createChat: builder.mutation<Chat, number>({
            query: (recipientId) => ({
                url: `api/chats/${recipientId}`,
                method: "POST",
            }),
            invalidatesTags: ["Chat"],
        }),
        removeChat: builder.mutation<{ message: string }, number>({
            query: (chatId) => ({
                url: `api/chats/${chatId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Chat"],
        }),
        getAllMessages: builder.query<
            PaginatedMessagesResponse,
            { chatId: number; page?: number; page_size?: number }
        >({
            query: ({ chatId, page, page_size }) => ({
                url: `api/chats/messages/${chatId}`,
                method: "GET",
                params: { page, page_size },
            }),
            serializeQueryArgs: ({ queryArgs }) => {
                return { chatId: queryArgs.chatId };
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems;
                }
                const existingIds = new Set(currentCache.data.map(m => m.id));
                const uniqueNewItems = newItems.data.filter(m => !existingIds.has(m.id));
                currentCache.data.push(...uniqueNewItems);
                currentCache.has_next_page = newItems.has_next_page;
                currentCache.current_page = newItems.current_page;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page || currentArg?.chatId !== previousArg?.chatId;
            },
            providesTags: ["Message"],
            async onCacheEntryAdded(
                { chatId },
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                const socket = getSocket();
                try {
                    await cacheDataLoaded;

                    socket.emit("join_chat", { chat_id: chatId });

                    socket.on("new_message", (message: Message) => {
                        if (message.chat_id !== chatId) return;
                        updateCachedData((draft) => {
                            const exists = draft.data.some(m => m.id === message.id);
                            if (!exists) {
                                draft.data.unshift(message);
                            }
                        });
                    });

                    socket.on("message_removed", ({ message_id }: { message_id: number }) => {
                        updateCachedData((draft) => {
                            draft.data = draft.data.filter((m) => m.id !== message_id);
                        });
                    });

                    socket.on("messages_read", (markedMessages: { id: number; chat_id: number; is_read: boolean }[]) => {
                        updateCachedData((draft) => {
                            markedMessages.forEach((mm) => {
                                if (mm.chat_id !== chatId) return;
                                const msg = draft.data.find((m) => m.id === mm.id);
                                if (msg) {
                                    msg.is_read = true;
                                }
                            });
                        });
                    });
                } catch {
                    // no-op
                }
                await cacheEntryRemoved;
                socket.off("new_message");
                socket.off("message_removed");
                socket.off("messages_read");
            },
        }),
        getUnreadCount: builder.query<number, void>({
            query: () => ({
                url: "api/chats/unread/count",
                method: "GET",
            }),
            providesTags: ["Chat", "Message"],
        }),
        getUnreadEach: builder.query<
            { chat_id: number; unread_count: number }[],
            void
        >({
            query: () => ({
                url: "api/chats/unread/each",
                method: "GET",
            }),
            providesTags: ["Chat", "Message"],
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
            ) {
                const socket = getSocket();
                try {
                    await cacheDataLoaded;

                    socket.on("new_message", (message: Message) => {
                        const state = getState() as RootState;
                        const user = userApi.endpoints.getMe.select()(state).data;

                        if (user && message.sender_id === user.id) {
                            return;
                        }

                        updateCachedData((draft) => {
                            const chat = draft.find((c) => c.chat_id === message.chat_id);
                            if (chat) {
                                chat.unread_count += 1;
                            } else {
                                draft.push({ chat_id: message.chat_id, unread_count: 1 });
                            }
                        });
                    });

                    socket.on("messages_read", (markedMessages: { id: number; chat_id: number; is_read: boolean }[]) => {
                        updateCachedData((draft) => {
                            if (markedMessages.length > 0) {
                                const chatId = markedMessages[0].chat_id;
                                const chat = draft.find((c) => c.chat_id === chatId);
                                if (chat) {
                                    chat.unread_count = Math.max(0, chat.unread_count - markedMessages.length);
                                }
                            }
                        });
                    });
                } catch {
                    // no-op
                }
                await cacheEntryRemoved;
                socket.off("new_message");
                socket.off("messages_read");
            },
        }),
        removeMessage: builder.mutation<
            { message: string; chat_id: number },
            number
        >({
            query: (messageId) => ({
                url: `api/chats/message/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Message", "Chat"],
        }),
        sendMessage: builder.mutation<Message, SendMessageDto>({
            query: (dto) => ({
                url: "api/chats/message",
                method: "POST",
                body: dto,
            }),
        }),
    }),
});

export const {
    useGetAllChatsQuery,
    useCreateChatMutation,
    useRemoveChatMutation,
    useGetAllMessagesQuery,
    useGetUnreadCountQuery,
    useGetUnreadEachQuery,
    useRemoveMessageMutation,
    useSendMessageMutation,
} = chatApi;
