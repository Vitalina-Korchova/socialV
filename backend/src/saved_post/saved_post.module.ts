import { Module } from '@nestjs/common';
import { SavedPostService } from './saved_post.service';
import { SavedPostController } from './saved_post.controller';

@Module({
  controllers: [SavedPostController],
  providers: [SavedPostService],
})
export class SavedPostModule {}
