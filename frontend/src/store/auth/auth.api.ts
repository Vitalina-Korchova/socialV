import { createApi } from "@reduxjs/toolkit/query/react";
import { LoginRequest, RegisterRequst } from "./auth.type";
import { baseQueryWithReauth } from "../baseQuery";
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({
    registerUser: builder.mutation<{ message: string }, RegisterRequst>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body: body,
      }),
    }),
    loginUser: builder.mutation<{ message: string }, LoginRequest>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body: body,
      }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),

    sendCodeEmail: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: "auth/send-reset-code",
        method: "POST",
        body: body,
      }),
    }),
    verifyCode: builder.mutation<
      { message: string },
      { email: string; code: string }
    >({
      query: (body) => ({
        url: "auth/verify-reset-code",
        method: "POST",
        body: body,
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { email: string; code: string; password: string }
    >({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useSendCodeEmailMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
  useLogoutUserMutation,
} = authApi;
