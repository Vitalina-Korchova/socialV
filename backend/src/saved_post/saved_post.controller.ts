import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SavedPostService } from './saved_post.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('api/saved-post')
export class SavedPostController {
  constructor(private readonly savedPostService: SavedPostService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleSavedPost(@Param('id', ParseIntPipe) postId: number, @Req() req) {
    const userId = req.user.id;
    return this.savedPostService.toggleSavedPost(postId, userId);
  }
}
