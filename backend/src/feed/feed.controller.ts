import {
  Controller,
  Get,
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
  constructor(private readonly feedService: FeedService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  generateFeed(
    @CurrentUser() user: { id: number },
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
  ) {
    return this.feedService.generateFeed(user.id, search, page, page_size);
  }
}
