export interface UserResponse {
  id: number;
  username: string;
  email: string;
  posts_count: number;
  followers_count: number;
  followings_count: number;
  created_at: string;
}

export interface UserRequestUpdate {
  username: string;
  email: string;
}
