export enum notificationsType {
  LIKE = 'LIKE',
  REPOST = 'REPOST',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  LVLUP = 'LVLUP',
}
export class NotificationsDto {
  id: number;
  notification_type: notificationsType;
  sender_id: number;
  recipient_id: number;
  post?: {
    post_id: number;
    post_image_url: string | null;
  } | null;
  user: {
    id: number;
    username: string;
    avatar_url: string | null;
  };
  is_read: boolean;
  created_at: Date;
}

export class PaginatedNotificationsResponse {
  current_page: number;
  total_items: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  data: NotificationsDto[];
}
