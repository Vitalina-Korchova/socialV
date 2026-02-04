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
  };
  created_at: Date;
  images: Image[];
  isLikedByMe: boolean;
  isRepostedByMe: boolean;
  isSavedByMe: boolean;
  likes: number;
  repostedByUsers?: {
    id: number;
    // image: Image;
    username: string;
  }[];
}

export interface PaginatedPostResponse {
  current_page: number;
  total_items: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  data: PostResponse[];
}
