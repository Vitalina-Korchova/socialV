import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { ImageModule } from 'src/image/image.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ImageModule],
  controllers: [PostController],
  providers: [PostService, PrismaService],
})
export class PostModule {}
