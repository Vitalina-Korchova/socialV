import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api/feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getFeed(
    @CurrentUser() user: { id: number },
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
    @Query('search') search?: string,
  ) {
    return this.feedService.getFeed(user.id, page, page_size, search);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generateFeed(@CurrentUser() user: { id: number }) {
    return this.feedService.generateFeed(user.id);
  }
}
