import { Controller } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
}
