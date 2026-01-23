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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api/likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.likeService.toggleLike(user.id, postId);
  }
}
