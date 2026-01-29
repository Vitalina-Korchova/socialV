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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostRequest, PostRequestUpdate } from './dto/post.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  async getPostsByUserId(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
  ) {
    return this.postService.getPostsByUserId(id, page, page_size);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  createPost(
    @CurrentUser() user: { id: number },
    @Body() dto: PostRequest,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return this.postService.createPost(user.id, dto, files?.images || []);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostRequestUpdate,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @CurrentUser() user: { id: number },
  ) {
    return this.postService.updatePost(id, user.id, dto, files?.images || []);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  removePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.postService.removePost(id, user.id);
  }
}
