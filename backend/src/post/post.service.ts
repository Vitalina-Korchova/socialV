import { Injectable, NotFoundException } from '@nestjs/common';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostRequest } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
  ) {}
  async createPost(dto: PostRequest, files: Express.Multer.File[]) {
    const userExist = await this.prismaService.user.findUnique({
      where: { id: dto.user_id },
    });

    if (!userExist) {
      throw new NotFoundException('User not found');
    }

    const post = await this.prismaService.post.create({
      data: {
        text_content: dto.text_content,
        user_id: dto.user_id,
      },
    });

    for (const file of files) {
      const imagePath = await this.imageService.saveImage(file, 'user-posts');
      const image = await this.prismaService.image.create({
        data: {
          url: imagePath,
        },
      });
      await this.prismaService.post_image.create({
        data: {
          post_id: post.id,
          image_id: image.id,
        },
      });
    }
    return post;
  }

  async getAll();
}
