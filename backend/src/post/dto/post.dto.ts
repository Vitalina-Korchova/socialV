import { IsNotEmpty, MaxLength } from 'class-validator';

export class PostRequest {
  @IsNotEmpty({ message: 'Text content is required' })
  text_content: string;
}

class Image {
  id: number;
  url: string;
}
export class PostResponse {
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

export class PaginatedPostResponse {
  current_page: number;
  total_items: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  data: PostResponse[];
}

export class PostRequestUpdate {
  @IsNotEmpty({ message: 'Text content is required' })
  text_content: string;
  keep_image_ids: number[];
}
