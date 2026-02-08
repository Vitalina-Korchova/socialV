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
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRequest } from './dto/comment.dto';
import { AuthGuard } from '@nestjs/passport';

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

  @Post('user/:id/')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: CommentRequest,
  ) {
    return this.commentService.createComment(userId, dto);
  }

  @Delete(':id/')
  @HttpCode(HttpStatus.OK)
  deleteComment(@Param('id', ParseIntPipe) commentId: number, @Request() req) {
    return this.commentService.deleteComment(commentId, req.user.id);
  }
}
