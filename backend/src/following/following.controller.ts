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
import { FollowingService } from './following.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api/following')
export class FollowingController {
  constructor(private readonly followingService: FollowingService) {}
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleFollow(
    @Param('id', ParseIntPipe) followingId: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.followingService.toggleFollow(user.id, followingId);
  }
}
