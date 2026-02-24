import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserResponse {
  id: number;
  username: string;
  email: string;
  created_at: Date;
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
  badges: string[];
}

export class UserRequestUpdate {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(30, { message: 'Username is too long' })
  @MinLength(3, { message: 'Username is too short' })
  username: string;

  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
}
export class TopUserResponse {
  id: number;
  username: string;
  avatar_url: string | null;
  border_url: string | null;
  first_badge: string | null;
  is_following: boolean;
  level: number;
}
