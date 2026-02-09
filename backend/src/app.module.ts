import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { LoggingMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './user/user.module';
import { ImageModule } from './image/image.module';
import { PostModule } from './post/post.module';
import { LikeModule } from './like/like.module';
import { SavedPostModule } from './saved_post/saved_post.module';
import { RepostModule } from './repost/repost.module';
import { CommentModule } from './comment/comment.module';
import { FollowingModule } from './following/following.module';
import { ShopItemModule } from './shop_item/shop_item.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MailModule,
    UserModule,
    ImageModule,
    PostModule,
    LikeModule,
    SavedPostModule,
    RepostModule,
    CommentModule,
    FollowingModule,
    ShopItemModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
