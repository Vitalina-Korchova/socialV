import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  imports: [AuthModule],
  exports: [ChatGateway],
})
export class ChatModule { }
