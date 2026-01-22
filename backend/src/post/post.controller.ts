import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostRequest, PostRequestUpdate } from './dto/post.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAll(@Query('page') page?: number, @Query('page_size') page_size?: number) {
    return this.postService.getAll(page, page_size);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPostById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  createPost(
    @Req() req,
    @Body() dto: PostRequest,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    const userId = req.user.id;
    return this.postService.createPost(userId, dto, files?.images || []);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostRequestUpdate,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.postService.updatePost(id, userId, dto, files?.images || []);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  removePost(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.postService.removePost(id, userId);
  }
}
