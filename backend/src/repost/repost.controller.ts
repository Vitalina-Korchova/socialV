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
import { RepostService } from './repost.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('api/reposts')
export class RepostController {
  constructor(private readonly repostService: RepostService) {}
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleSavedPost(@Param('id', ParseIntPipe) postId: number, @Req() req) {
    const userId = req.user.id;
    return this.repostService.toggleRepost(postId, userId);
  }
}
