import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { Inject, UseFilters, UseGuards, forwardRef } from '@nestjs/common';
import { AllExceptionsFilter } from 'src/auth/guards/ws-exception-filter';
import { MarkedMessage, SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
@UseFilters(new AllExceptionsFilter())
export class ChatGateway {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) { }

  @WebSocketServer()
  server: Server;

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chat_id: number },
  ) {
    client.join(`chat_${data.chat_id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chat_id: number; text: string },
  ) {
    const user = (client as any).user;
    const userId = user.id;

    const dto: SendMessageDto = {
      chat_id: Number(data.chat_id),
      text: data.text,
    };

    const message = await this.chatService.sendMessage(userId, dto);

    // Emit only to that chat room
    this.server.to(`chat_${data.chat_id}`).emit('new_message', message);

    return message;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark_messages_read')
  async handleMarkMessagesRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chat_id: number; message_ids: number[] },
  ) {
    try {
      const user = (client as any).user;
      const userId = user.id;

      const markedMessages = await this.chatService.markMessagesAsRead(
        userId,
        data.chat_id,
        data.message_ids,
      );

      if (markedMessages && markedMessages.length > 0) {
        this.server
          .to(`chat_${data.chat_id}`)
          .emit('messages_read', markedMessages);
      }

      return {
        success: true,
        data: {
          messaged_marked: markedMessages,
        },
      };
    } catch (error) {
      client.emit('error', {
        message: error.message || 'Failed to mark messages as read',
      });
      throw error;
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('remove_message')
  async handleRemoveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message_id: number },
  ) {
    try {
      const user = (client as any).user;
      const userId = user.id;

      const result = await this.chatService.removeMessage(
        data.message_id,
        userId,
      );

      this.server
        .to(`chat_${result.chat_id}`)
        .emit('message_removed', { message_id: data.message_id });

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      client.emit('error', {
        message: error.message || 'Failed to remove message',
      });
      throw error;
    }
  }
}
