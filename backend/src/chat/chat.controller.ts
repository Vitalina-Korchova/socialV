import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto/chat.dto';

@Controller('api/chats')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser('id') userId: number) {
    return this.chatService.getUnreadChatsCount(userId);
  }

  @Get('unread/each')
  async getUnreadEach(@CurrentUser('id') userId: number) {
    return this.chatService.getChatsWithUnreadCount(userId);
  }

  @Get('messages/:chatId')
  async getAllMessages(
    @CurrentUser('id') currentUserId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
  ) {
    return this.chatService.getAllMessages(
      chatId,
      currentUserId,
      Number(page),
      Number(page_size),
    );
  }

  @Post('message')
  async sendMessage(
    @CurrentUser('id') userId: number,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(userId, dto);
  }

  @Delete('message/:messageId')
  async removeMessage(
    @CurrentUser('id') userId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return this.chatService.removeMessage(messageId, userId);
  }

  @Get()
  async getAllChats(
    @CurrentUser('id') currentUserId: number,
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
  ) {
    return this.chatService.getAllChats(
      currentUserId,
      Number(page),
      Number(page_size),
    );
  }

  @Post(':recipientId')
  async createChat(
    @CurrentUser('id') currentUserId: number,
    @Param('recipientId', ParseIntPipe) recipientId: number,
  ) {
    return this.chatService.createChat(currentUserId, recipientId);
  }

  @Delete(':chatId')
  async removeChat(
    @CurrentUser('id') currentUserId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return this.chatService.removeChat(chatId, currentUserId);
  }
}
