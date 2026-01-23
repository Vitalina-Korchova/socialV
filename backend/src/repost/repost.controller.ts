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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api/reposts')
export class RepostController {
  constructor(private readonly repostService: RepostService) {}
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleSavedPost(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.repostService.toggleRepost(postId, user.id);
  }
}
