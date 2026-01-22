import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginatedPostResponse,
  PostRequest,
  PostRequestUpdate,
} from './dto/post.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('APP_URL');
  }
  async createPost(
    userId: number,
    dto: PostRequest,
    files: Express.Multer.File[],
  ) {
    const post = await this.prismaService.post.create({
      data: {
        text_content: dto.text_content,
        user_id: userId,
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

  async getAll(
    page?: number,
    page_size?: number,
  ): Promise<PaginatedPostResponse> {
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = page_size && page_size > 0 ? page_size : 10;
    const skip = (currentPage - 1) * pageSize;
    const totalItems = await this.prismaService.post.count();

    const posts = await this.prismaService.post.findMany({
      select: {
        id: true,
        text_content: true,
        created_at: true,
        user_id: true,
        images: {
          select: {
            image: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        likes: true,
        saved_post: true,
        reposts: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      data: posts.map((post) => ({
        id: post.id,
        text_content: post.text_content,
        created_at: post.created_at,
        user: post.user,
        images: post.images.map((img) => ({
          id: img.image.id,
          url: `${this.baseUrl}/uploads/${img.image.url}`,
        })),
        likes: post.likes.length,
        saved_number: post.saved_post.length,
        reposts_number: post.reposts.length,
      })),
      current_page: currentPage,
      total_items: totalItems,
      has_next_page: currentPage < totalPages,
      has_previous_page: currentPage > 1,
    };
  }

  async getPostById(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      select: {
        id: true,
        text_content: true,
        created_at: true,
        user_id: true,
        images: {
          select: {
            image: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return {
      id: post.id,
      text_content: post.text_content,
      created_at: post.created_at,
      user: post.user,
      images: post.images.map((img) => ({
        id: img.image.id,
        url: `${this.baseUrl}/uploads/${img.image.url}`,
      })),
    };
  }

  async updatePost(
    id: number,
    userId: number,
    dto: PostRequestUpdate,
    files: Express.Multer.File[],
  ) {
    const existPost = await this.prismaService.post.findUnique({
      where: { id },
    });

    if (!existPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (existPost.user_id !== userId) {
      throw new ForbiddenException('User can only edit his own posts');
    }

    return this.prismaService.$transaction(async (tx) => {
      if (dto.text_content !== undefined) {
        await tx.post.update({
          where: { id },
          data: { text_content: dto.text_content },
        });
      }

      const postImages = await tx.post_image.findMany({
        where: { post_id: id },
        select: { image_id: true },
      });

      const currentImageIds = postImages.map((img) => img.image_id);

      const keepImageIds = Array.isArray(dto.keep_image_ids)
        ? dto.keep_image_ids.map(Number)
        : dto.keep_image_ids
          ? [Number(dto.keep_image_ids)]
          : [];

      const imagesToDelete = currentImageIds.filter(
        (imgId) => !keepImageIds.includes(imgId),
      );

      if (imagesToDelete.length > 0) {
        await tx.post_image.deleteMany({
          where: {
            post_id: id,
            image_id: { in: imagesToDelete },
          },
        });

        await tx.image.deleteMany({
          where: {
            id: { in: imagesToDelete },
          },
        });
      }

      for (const file of files) {
        const imagePath = await this.imageService.saveImage(file, 'user-posts');

        const image = await tx.image.create({
          data: { url: imagePath },
        });

        await tx.post_image.create({
          data: {
            post_id: id,
            image_id: image.id,
          },
        });
      }

      return {
        success: true,
        message: 'Post updated successfully',
      };
    });
  }

  async removePost(
    id: number,
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    const existPost = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!existPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (existPost.user_id !== userId) {
      throw new ForbiddenException('User can only delete his own posts');
    }

    return await this.prismaService.$transaction(async (tx) => {
      const postRelatedImages = await tx.post_image.findMany({
        where: { post_id: id },
        select: { image_id: true },
      });

      await tx.post_image.deleteMany({
        where: { post_id: id },
      });

      if (postRelatedImages.length > 0) {
        await tx.image.deleteMany({
          where: {
            id: {
              in: postRelatedImages.map((img) => img.image_id),
            },
          },
        });
      }

      //DELETING LIKES COMMENTS REPOSTS !!!!!
      await tx.post.delete({ where: { id } });
      return {
        success: true,
        message: `Post with ID ${id} has been deleted successfully`,
      };
    });
  }
}
