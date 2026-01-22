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
import { LikeService } from './like.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('api/likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Param('id', ParseIntPipe) postId: number, @Req() req) {
    const userId = req.user.id;
    return this.likeService.toggleLike(userId, postId);
  }
}
