export interface SendMessageDto {
    chat_id: number;
    text: string;
}

export interface Chat {
    id: number;
    first_user: {
        id: number;
        username: string;
        avatar_url: string | null;
    };
    second_user: {
        id: number;
        username: string;
        avatar_url: string | null;
    };
    last_message: {
        id: number;
        text_content: string;
        sender_id: number;
        is_read: boolean;
        created_at: Date;
    };
}

export interface PaginatedChatsResponse {
    current_page: number;
    total_items: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    data: Chat[];
}

export interface Message {
    id: number;
    text_content: string;
    chat_id: number;
    sender_id: number;
    sender: {
        id: number;
        username: string;
        avatar_url: string | null;
    };
    created_at: Date;
    is_read: boolean;
}

export interface MarkedMessage {
    id: number;
    chat_id: number;
    is_read: boolean;
}

export interface PaginatedMessagesResponse {
    current_page: number;
    total_items: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    data: Message[];
}