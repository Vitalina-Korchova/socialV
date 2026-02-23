import { IsInt, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CommentRequest {
  @IsNotEmpty({ message: 'Text is required' })
  @MaxLength(250, { message: 'Text is too long' })
  @MinLength(1, { message: 'Text is too short' })
  text: string;
  @IsInt()
  post_id: number;
}

export class CommentResponse {
  id: number;
  text: string;
  user: {
    id: number;
    username: string;
    avatar_url: string | null;
    border_url: string | null;
  };
  post_id: number;
  created_at: Date;
}

export class PaginatedCommentsResponse {
  current_page: number;
  total_items: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  data: CommentResponse[];
}
