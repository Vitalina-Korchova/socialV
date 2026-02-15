import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRequest } from './dto/comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Get('post/:id/')
  @HttpCode(HttpStatus.OK)
  getAll(
    @Param('id', ParseIntPipe) postId: number,
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
  ) {
    return this.commentService.getAllComments(postId, page, page_size);
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Body() dto: CommentRequest,
    @CurrentUser() user: { id: number },
  ) {
    return this.commentService.createComment(user.id, dto);
  }

  @Delete(':id/')
  @HttpCode(HttpStatus.OK)
  deleteComment(@Param('id', ParseIntPipe) commentId: number, @CurrentUser() user: { id: number },) {
    return this.commentService.deleteComment(commentId, user.id);
  }
}
