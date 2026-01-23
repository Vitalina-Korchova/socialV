export class CommentRequest {
  text: string;
  post_id: number;
}

export class CommentResponse {
  id: number;
  text: string;
  user: {
    id: number;
    username: string;
    email: string;
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
