export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface UserRequestUpdate {
  username: string;
  email: string;
}
