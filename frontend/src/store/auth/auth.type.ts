export interface RegisterRequst {
  username: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserMe {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
}
