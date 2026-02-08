export interface CommentRequest {
    text: string;
    post_id: number;
}

export interface CommentResponse {
    id: number;
    text: string;
    user: {
        id: number;
        username: string;
        avatar_url: string | null;
    };
    post_id: number;
    created_at: Date;
}

export interface PaginatedCommentsResponse {
    current_page: number;
    total_items: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    data: CommentResponse[];
}
