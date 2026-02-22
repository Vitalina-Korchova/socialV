export interface MyShopItemsResponse {
  id: number;
  type: string;
  required_level: number;
  is_active: boolean;
  badge_name: string | null;
  image_url: string | null;
}

export interface SetShopItemActiveOrBuy {
  itemId: number;
  type: string;
}

export interface ShopItemsToBuy {
  id: number;
  type: string;
  required_level: number;
  price_coins: number;
  badge_name: string | null;
  image_url: string | null;
}
