import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authApi } from "./auth/auth.api";
import { userApi } from "./user/user.api";
import { postApi } from "./post/post.api";
import { likeRepostSavedpostApi } from "./like-repost-savedpost/like-repost-savedpost.api";
import searchReducer from "./post/search.slice";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [likeRepostSavedpostApi.reducerPath]: likeRepostSavedpostApi.reducer,
  search: searchReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(postApi.middleware)
      .concat(likeRepostSavedpostApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
