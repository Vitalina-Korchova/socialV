import {
  Controller,
  Get,
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
  constructor(private readonly followingService: FollowingService) { }
  @Get('followings')
  @HttpCode(HttpStatus.OK)
  async getMyFollowingUsers(@CurrentUser() user: { id: number }) {
    return this.followingService.getAllFollowingUsers(user.id);
  }

  @Get('followers')
  @HttpCode(HttpStatus.OK)
  async getMyFollowers(@CurrentUser() user: { id: number }) {
    return this.followingService.getAllFollowersUsers(user.id);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleFollow(
    @Param('id', ParseIntPipe) followingId: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.followingService.toggleFollow(user.id, followingId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async isUserFollowing(
    @Param('id', ParseIntPipe) followingId: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.followingService.isUserFollowing(user.id, followingId);
  }
}
