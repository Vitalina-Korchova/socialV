import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostRequest } from './dto/post.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  createPost(
    @Body() dto: PostRequest,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return this.postService.createPost(dto, files?.images || []);
  }
}
