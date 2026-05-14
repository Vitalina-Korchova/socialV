import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { ImageModule } from 'src/image/image.module';
import { XpModule } from 'src/xp/xp.module';

@Module({
  imports: [ImageModule, XpModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule { }
