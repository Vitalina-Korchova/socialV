export interface UserResponse {
  id: number;
  username: string;
  email: string;
  posts_count: number;
  followers_count: number;
  followings_count: number;
  avatar_url: string | null;
  background_url: string | null;
  border_url: string | null;
  amount_xp: number;
  level: number;
  amount_coins: number;
  total_xp_required_level: number;
  created_at: string;
}

export interface UserRequestUpdate {
  username: string;
  email: string;
}
