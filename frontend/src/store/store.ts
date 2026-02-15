import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authApi } from "./auth/auth.api";
import { userApi } from "./user/user.api";
import { postApi } from "./post/post.api";
import { likeRepostSavedpostApi } from "./like-repost-savedpost/like-repost-savedpost.api";
import { followingApi } from "./following/following.api";
import { commentApi } from "./comment/comment.api";
import { notificationsApi } from "./notifications/notifications.api";
import { chatApi } from "./chat/chat.api";
import searchReducer from "./post/search.slice";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [likeRepostSavedpostApi.reducerPath]: likeRepostSavedpostApi.reducer,
  [followingApi.reducerPath]: followingApi.reducer,
  [commentApi.reducerPath]: commentApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  search: searchReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(postApi.middleware)
      .concat(likeRepostSavedpostApi.middleware)
      .concat(followingApi.middleware)
      .concat(commentApi.middleware)
      .concat(notificationsApi.middleware)
      .concat(chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
