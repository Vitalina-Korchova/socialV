import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import {
    MyShopItemsResponse,
    SetShopItemActiveOrBuy,
    ShopItemsToBuy
} from "./shop_item.type";
import { userApi } from "../user/user.api";

export const shopItemApi = createApi({
    reducerPath: "shopItemApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["ShopItem"],
    endpoints: (builder) => ({
        getUserShopItems: builder.query<MyShopItemsResponse[], string>({
            query: (type) => ({
                url: `api/shop-items?type=${type}`,
                method: "GET",
            }),
            providesTags: ["ShopItem"],
        }),
        getShopItemsToBuy: builder.query<ShopItemsToBuy[], string>({
            query: (type) => ({
                url: `api/shop-items/shop-items-to-buy-show?type=${type}`,
                method: "GET",
            }),
            providesTags: ["ShopItem"],
        }),
        setShopItemActive: builder.mutation<void, SetShopItemActiveOrBuy>({
            query: (dto) => ({
                url: "api/shop-items/set-active",
                method: "POST",
                body: dto,
            }),
            invalidatesTags: ["ShopItem"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(userApi.util.invalidateTags(["User"]));
                } catch { }
            },
        }),
        buyShopItem: builder.mutation<void, SetShopItemActiveOrBuy>({
            query: (dto) => ({
                url: "api/shop-items/buy-shop-item",
                method: "POST",
                body: dto,
            }),
            invalidatesTags: ["ShopItem"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(userApi.util.invalidateTags(["User"]));
                } catch { }
            },
        }),
        setBadgesActive: builder.mutation<void, number[]>({
            query: (badgeIds) => ({
                url: "api/shop-items/set-badges-active",
                method: "POST",
                body: { badgeIds },
            }),
            invalidatesTags: ["ShopItem"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(userApi.util.invalidateTags(["User"]));
                } catch { }
            },
        }),
    }),
});

export const {
    useGetUserShopItemsQuery,
    useGetShopItemsToBuyQuery,
    useSetShopItemActiveMutation,
    useBuyShopItemMutation,
    useSetBadgesActiveMutation,
} = shopItemApi;
