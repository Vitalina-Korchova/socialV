export class FollowingResponseUser {
  id: number;
  username: string;
  avatar_url: string | null;
  border_url: string | null;
}

export class FollowingResponseUsers {
  users: FollowingResponseUser[];
}
