import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { notificationsType, PaginatedNotificationsResponse } from './dto/notifications.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
    private readonly baseUrl: string;
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.getOrThrow<string>('APP_URL');
    }

    async createNotification(
        sender_id: number,
        recipient_id: number,
        notification_type: notificationsType,
        post_id?: number,
    ) {
        if (sender_id === recipient_id) return;

        return await this.prismaService.notification.create({
            data: {
                sender_id,
                recipient_id,
                notification_type: notification_type as any,
                post_id,
            },
        });
    }

    async getNotificationsByUserId(
        userId: number,
        page?: number,
        page_size?: number,
    ): Promise<PaginatedNotificationsResponse> {
        const currentPage = page && page > 0 ? page : 1;
        const pageSize = page_size && page_size > 0 ? page_size : 10;
        const skip = (currentPage - 1) * pageSize;

        const totalItems = await this.prismaService.notification.count({
            where: { recipient_id: userId },
        });

        const notifications = await this.prismaService.notification.findMany({
            where: { recipient_id: userId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        user_shop_items: {
                            where: {
                                is_active: true,
                                shop_item: {
                                    type: 'AVATAR',
                                },
                            },
                            select: {
                                shop_item: {
                                    select: {
                                        item_image: {
                                            select: {
                                                url: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
            skip: skip,
            take: pageSize,
        });

        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            current_page: currentPage,
            total_items: totalItems,
            has_next_page: currentPage < totalPages,
            has_previous_page: currentPage > 1,
            data: notifications.map((n) => {
                const avatar = n.sender.user_shop_items[0]?.shop_item?.item_image?.url;
                return {
                    id: n.id,
                    notification_type: n.notification_type as any,
                    sender_id: n.sender_id,
                    recipient_id: n.recipient_id,
                    post_id: n.post_id,
                    is_read: n.is_read,
                    created_at: n.created_at,
                    user: {
                        id: n.sender.id,
                        username: n.sender.username,
                        avatar_url: avatar ? `${this.baseUrl}/uploads/${avatar}` : null,
                    },
                };
            }) as any,
        };
    }

    async getUnreadCount(userId: number) {
        return await this.prismaService.notification.count({
            where: {
                recipient_id: userId,
                is_read: false,
            },
        });
    }

    async markAsRead(notificationId: number, userId: number) {
        const notification = await this.prismaService.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.recipient_id !== userId) {
            throw new NotFoundException('Notification not found');
        }

        return await this.prismaService.notification.update({
            where: { id: notificationId },
            data: { is_read: true },
        });
    }
}
