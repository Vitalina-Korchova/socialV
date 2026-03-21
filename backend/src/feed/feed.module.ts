import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PostModule } from 'src/post/post.module';
import { GeminiAiModule } from 'src/gemini_ai/gemini_ai.module';

@Module({
  imports: [PostModule, GeminiAiModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule { }
