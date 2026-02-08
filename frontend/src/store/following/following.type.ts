export interface FollowingUser {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface FollowingUsersResponse {
  users: FollowingUser[];
}
