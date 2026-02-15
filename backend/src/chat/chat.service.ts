import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginatedChatsResponse,
  PaginatedMessagesResponse,
  Message,
  SendMessageDto,
  MarkedMessage,
} from './dto/chat.dto';
import { ConfigService } from '@nestjs/config';
import { item_shop_type } from '@prisma/client';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('APP_URL');
  }

  async createChat(currentUserId: number, recipientId: number) {
    if (currentUserId === recipientId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }

    const recipient = await this.prismaService.user.findUnique({
      where: { id: recipientId },
    });
    if (!recipient) {
      throw new NotFoundException('User not found');
    }

    const [firstUserId, secondUserId] =
      currentUserId < recipientId
        ? [currentUserId, recipientId]
        : [recipientId, currentUserId];

    const existingChat = await this.prismaService.chat.findUnique({
      where: {
        first_user_id_second_user_id: {
          first_user_id: firstUserId,
          second_user_id: secondUserId,
        },
      },
      include: {
        first_user: {
          select: { id: true },
        },
        second_user: {
          select: { id: true },
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    const chat = await this.prismaService.chat.create({
      data: {
        first_user_id: firstUserId,
        second_user_id: secondUserId,
      },
      include: {
        first_user: {
          select: { id: true },
        },
        second_user: {
          select: { id: true },
        },
      },
    });
    return chat;
  }

  async removeChat(chatId: number, currentUserId: number) {
    const chat = await this.prismaService.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (
      chat.first_user_id !== currentUserId &&
      chat.second_user_id !== currentUserId
    ) {
      throw new BadRequestException(
        'You are not authorized to remove this chat',
      );
    }
    await this.prismaService.chat.delete({
      where: { id: chatId },
    });

    // Optionally broadcast chat removal, but standard is just to refresh list on next fetch
    // or emit to both users if they are connected.

    return { message: 'Chat removed successfully' };
  }

  async getAllChats(
    currentUserId: number,
    page?: number,
    page_size?: number,
  ): Promise<PaginatedChatsResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentPage = page && page > 0 ? page : 1;
    const pageSize = page_size && page_size > 0 ? page_size : 10;
    const skip = (currentPage - 1) * pageSize;

    const whereCondition = {
      OR: [{ first_user_id: currentUserId }, { second_user_id: currentUserId }],
    };

    const totalItems = await this.prismaService.chat.count({
      where: whereCondition,
    });

    const chats = await this.prismaService.chat.findMany({
      where: whereCondition,
      include: {
        first_user: {
          select: { id: true, username: true },
        },
        second_user: {
          select: { id: true, username: true },
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: {
            id: true,
            text_content: true,
            created_at: true,
            sender_id: true,
            is_read: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: skip,
      take: pageSize,
    });

    const participantIds = [
      ...new Set(
        chats.flatMap((chat) => [chat.first_user_id, chat.second_user_id]),
      ),
    ];

    const activeAvatars = await this.prismaService.user_shop_item.findMany({
      where: {
        user_id: { in: participantIds },
        is_active: true,
        shop_item: {
          type: item_shop_type.AVATAR,
        },
      },
      select: {
        user_id: true,
        shop_item: {
          select: {
            item_image: {
              select: { url: true },
            },
          },
        },
      },
    });

    const avatarMap = new Map<number, string>();
    activeAvatars.forEach((aa) => {
      if (aa.shop_item?.item_image?.url) {
        avatarMap.set(
          aa.user_id,
          `${this.baseUrl}/uploads/${aa.shop_item.item_image.url}`,
        );
      }
    });

    const data = chats.map((chat) => ({
      id: chat.id,
      first_user: {
        id: chat.first_user.id,
        username: chat.first_user.username,
        avatar_url: avatarMap.get(chat.first_user.id) || null,
      },
      second_user: {
        id: chat.second_user.id,
        username: chat.second_user.username,
        avatar_url: avatarMap.get(chat.second_user.id) || null,
      },
      last_message: chat.messages[0] ? {
        id: chat.messages[0].id,
        text_content: chat.messages[0].text_content,
        sender_id: chat.messages[0].sender_id,
        is_read: chat.messages[0].is_read,
        created_at: chat.messages[0].created_at,
      } : null,
    }));

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      current_page: currentPage,
      total_items: totalItems,
      has_next_page: currentPage < totalPages,
      has_previous_page: currentPage > 1,
      data,
    };
  }

  async sendMessage(userId: number, dto: SendMessageDto): Promise<Message> {
    const chat = await this.prismaService.chat.findUnique({
      where: { id: dto.chat_id },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.first_user_id !== userId && chat.second_user_id !== userId) {
      throw new BadRequestException(
        'You are not authorized to send messages to this chat',
      );
    }

    const message = await this.prismaService.message.create({
      data: {
        chat_id: dto.chat_id,
        sender_id: userId,
        text_content: dto.text,
      },
      include: {
        sender: {
          select: { id: true, username: true },
        },
      },
    });

    const activeAvatar = await this.prismaService.user_shop_item.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        shop_item: {
          type: item_shop_type.AVATAR,
        },
      },
      select: {
        shop_item: {
          select: {
            item_image: {
              select: { url: true },
            },
          },
        },
      },
    });

    const avatarUrl = activeAvatar?.shop_item?.item_image?.url
      ? `${this.baseUrl}/uploads/${activeAvatar.shop_item.item_image.url}`
      : null;

    const response: Message = {
      id: message.id,
      text_content: message.text_content,
      is_read: message.is_read,
      chat_id: message.chat_id,
      created_at: message.created_at,
      sender_id: message.sender_id,
      sender: {
        id: message.sender.id,
        username: message.sender.username,
        avatar_url: avatarUrl,
      },
    };

    // Broadcast to the room
    if (this.chatGateway.server) {
      this.chatGateway.server
        .to(`chat_${dto.chat_id}`)
        .emit('new_message', response);
    }

    return response;
  }

  async getAllMessages(
    chatId: number,
    userId: number,
    page?: number,
    page_size?: number,
  ): Promise<PaginatedMessagesResponse> {
    const chat = await this.prismaService.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (chat.first_user_id !== userId && chat.second_user_id !== userId) {
      throw new BadRequestException('You are not authorized to view this chat');
    }

    const currentPage = page && page > 0 ? page : 1;
    const pageSize = page_size && page_size > 0 ? page_size : 10;
    const skip = (currentPage - 1) * pageSize;

    const totalItems = await this.prismaService.message.count({
      where: { chat_id: chatId },
    });

    const messages = await this.prismaService.message.findMany({
      where: { chat_id: chatId },
      orderBy: { created_at: 'desc' },
      skip: skip,
      take: pageSize,
      include: {
        sender: {
          select: { id: true, username: true },
        },
      },
    });

    const participantIds = [...new Set(messages.map((m) => m.sender_id))];

    const activeAvatars = await this.prismaService.user_shop_item.findMany({
      where: {
        user_id: { in: participantIds },
        is_active: true,
        shop_item: {
          type: item_shop_type.AVATAR,
        },
      },
      select: {
        user_id: true,
        shop_item: {
          select: {
            item_image: {
              select: { url: true },
            },
          },
        },
      },
    });

    const avatarMap = new Map<number, string>();
    activeAvatars.forEach((aa) => {
      if (aa.shop_item?.item_image?.url) {
        avatarMap.set(
          aa.user_id,
          `${this.baseUrl}/uploads/${aa.shop_item.item_image.url}`,
        );
      }
    });

    const data = messages.map((m) => ({
      id: m.id,
      chat_id: m.chat_id,
      text_content: m.text_content,
      sender_id: m.sender_id,
      is_read: m.is_read,
      created_at: m.created_at,
      sender: {
        id: m.sender.id,
        username: m.sender.username,
        avatar_url: avatarMap.get(m.sender.id) || null,
      },
    }));

    return {
      current_page: currentPage,
      total_items: totalItems,
      has_next_page: currentPage < Math.ceil(totalItems / pageSize),
      has_previous_page: currentPage > 1,
      data,
    };
  }

  async markMessagesAsRead(
    userId: number,
    chatId: number,
    messageIds: number[],
  ): Promise<MarkedMessage[]> {
    const chat = await this.prismaService.chat.findUnique({
      where: { id: chatId },
    });

    if (
      !chat ||
      (chat.first_user_id !== userId && chat.second_user_id !== userId)
    ) {
      throw new BadRequestException('You are not a participant of this chat');
    }

    const messages = await this.prismaService.message.findMany({
      where: {
        id: { in: messageIds },
        chat_id: chatId,
        sender_id: { not: userId },
      },
      select: {
        id: true,
        chat_id: true,
      },
    });

    if (messages.length === 0) {
      return [];
    }

    const validMessageIds = messages.map((msg) => msg.id);

    await this.prismaService.message.updateMany({
      where: {
        id: { in: validMessageIds },
      },
      data: { is_read: true },
    });

    return validMessageIds.map((id) => ({
      id: id,
      chat_id: chatId,
      is_read: true,
    }));
  }

  async getUnreadChatsCount(userId: number): Promise<number> {
    const unreadChats = await this.prismaService.chat.count({
      where: {
        OR: [{ first_user_id: userId }, { second_user_id: userId }],
        messages: {
          some: {
            sender_id: { not: userId },
            is_read: false,
          },
        },
      },
    });
    return unreadChats;
  }

  async getChatsWithUnreadCount(
    userId: number,
  ): Promise<{ chat_id: number; unread_count: number }[]> {
    const chats = await this.prismaService.chat.findMany({
      where: {
        OR: [{ first_user_id: userId }, { second_user_id: userId }],
      },
      select: {
        id: true,
        messages: {
          where: {
            sender_id: { not: userId },
            is_read: false,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return chats
      .map((chat) => ({
        chat_id: chat.id,
        unread_count: chat.messages.length,
      }))
      .filter((chat) => chat.unread_count > 0);
  }

  async removeMessage(messageId: number, userId: number) {
    const message = await this.prismaService.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new BadRequestException(
        'You are not authorized to remove this message',
      );
    }

    await this.prismaService.message.delete({
      where: { id: messageId },
    });

    return { message: 'Message removed successfully', chat_id: message.chat_id };
  }
}
