export class PostImageDTO {
  mimeType: string; // наприклад, 'image/jpeg' або 'image/png'
  data: string; // сам рядок base64 (без префікса data:image/jpeg;base64,)
}
export class PostsContentDTO {
  id: number;
  text: string;
  tags?: string[];
  images?: PostImageDTO[];
}

export class PostsActionDTO {
  action: string;
  text: string;
  tags?: string[];
  images?: PostImageDTO[];
}

export class RequestDataDTOAIGemini {
  recent_actions: PostsActionDTO[];
  follower_posts: PostsContentDTO[];
  general_posts: PostsContentDTO[];
}

export class ResponseDataAIGemini {
  ranked_post_ids: number[];
}
