interface Image {
  id: number;
  url: string;
}

export interface PostResponse {
  id: number;
  text_content: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatar_url: string | null;
    border_url: string | null;
    badges: string[];
  };
  created_at: Date;
  images: Image[];
  isLikedByMe: boolean;
  isRepostedByMe: boolean;
  isSavedByMe: boolean;
  likes: number;
  comments_count: number;
  repostedByUsers?: {
    id: number;
    username: string;
    avatar_url: string | null;
    border_url: string | null;
    badges: string[];
  }[];
}

export interface PaginatedPostResponse {
  current_page: number;
  total_items: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  data: PostResponse[];
}
