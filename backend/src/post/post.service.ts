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
import { item_shop_type, Prisma, action_type_score } from '@prisma/client';
import { XpService } from 'src/xp/xp.service';

type PostsType = 'all' | 'mine' | 'saved';

@Injectable()
export class PostService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
    private readonly xpService: XpService,
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
    await this.xpService.awardXp(userId, action_type_score.CREATE_POST);
    return post;
  }

  async getAllPosts(
    userId: number,
    type: PostsType = 'all',
    search?: string,
    page?: number,
    page_size?: number,
  ): Promise<PaginatedPostResponse> {
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = page_size && page_size > 0 ? page_size : 10;
    const skip = (currentPage - 1) * pageSize;

    const baseWhere =
      type === 'mine'
        ? { user_id: userId }
        : type === 'saved'
          ? {
            saved_post: {
              some: { user_id: userId },
            },
          }
          : {};

    const where: Prisma.postWhereInput = {
      ...baseWhere,
      ...(search && {
        text_content: { contains: search, mode: 'insensitive' },
      }),
    } as Prisma.postWhereInput;

    const totalItems = await this.prismaService.post.count({ where });

    const posts = await this.prismaService.post.findMany({
      where,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },

      orderBy: {
        created_at: 'desc',
      },
      skip: skip,
      take: pageSize,
    });

    const existMyLike = await this.prismaService.like.findMany({
      where: {
        post_id: {
          in: posts.map((post) => post.id),
        },
        user_id: userId,
      },
    });
    const isRepost = await this.prismaService.repost.findMany({
      where: {
        post_id: {
          in: posts.map((post) => post.id),
        },
        user_id: userId,
      },
    });
    const isSaved = await this.prismaService.saved_post.findMany({
      where: {
        post_id: {
          in: posts.map((post) => post.id),
        },
        user_id: userId,
      },
    });

    const userFollowings = await this.prismaService.following.findMany({
      where: {
        follower_id: userId,
      },
      select: {
        following_id: true,
      },
    });
    const repostOfMyFollowings = await this.prismaService.repost.findMany({
      where: {
        user_id: {
          in: userFollowings.map((following) => following.following_id),
        },
        post_id: {
          in: posts.map((post) => post.id),
        },
      },
      select: {
        post_id: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const postUserIds = [...new Set(posts.map((p) => p.user.id))];

    const activeShopItems = await this.prismaService.user_shop_item.findMany({
      where: {
        user_id: { in: postUserIds },
        is_active: true,
      },
      select: {
        user_id: true,
        shop_item: {
          select: {
            type: true,
            badge_name: true,
            item_image: {
              select: { url: true },
            },
          },
        },
      },
    });

    const userShopItemMap = new Map<number, { [key in item_shop_type]?: string | string[] }>();
    activeShopItems.forEach((item) => {
      let userItems = userShopItemMap.get(item.user_id);
      if (!userItems) {
        userItems = {};
        userShopItemMap.set(item.user_id, userItems);
      }

      if (item.shop_item.type === item_shop_type.BADGE) {
        if (!userItems[item_shop_type.BADGE]) {
          userItems[item_shop_type.BADGE] = [];
        }
        if (item.shop_item.badge_name) {
          (userItems[item_shop_type.BADGE] as string[]).push(item.shop_item.badge_name);
        }
      } else if (item.shop_item.item_image?.url) {
        userItems[item.shop_item.type] = `${this.baseUrl}/uploads/${item.shop_item.item_image.url}`;
      }
    });

    const repostUserIds = [
      ...new Set(repostOfMyFollowings.map((repost) => repost.user.id)),
    ];

    const activeReposrFollowingsItems =
      await this.prismaService.user_shop_item.findMany({
        where: {
          user_id: { in: repostUserIds },
          is_active: true,
        },
        select: {
          user_id: true,
          shop_item: {
            select: {
              type: true,
              badge_name: true,
              item_image: {
                select: { url: true },
              },
            },
          },
        },
      });

    const repostItemMap = new Map<number, { [key in item_shop_type]?: string | string[] }>();
    activeReposrFollowingsItems.forEach((item) => {
      let userItems = repostItemMap.get(item.user_id);
      if (!userItems) {
        userItems = {};
        repostItemMap.set(item.user_id, userItems);
      }

      if (item.shop_item.type === item_shop_type.BADGE) {
        if (!userItems[item_shop_type.BADGE]) {
          userItems[item_shop_type.BADGE] = [];
        }
        if (item.shop_item.badge_name) {
          (userItems[item_shop_type.BADGE] as string[]).push(item.shop_item.badge_name);
        }
      } else if (item.shop_item.item_image?.url) {
        userItems[item.shop_item.type] = `${this.baseUrl}/uploads/${item.shop_item.item_image.url}`;
      }
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      data: posts.map((post) => {
        const userItems = userShopItemMap.get(post.user.id);
        return {
          id: post.id,
          text_content: post.text_content,
          created_at: post.created_at,
          user: {
            id: post.user.id,
            username: post.user.username,
            email: post.user.email,
            avatar_url: (userItems?.[item_shop_type.AVATAR] as string) || null,
            border_url: (userItems?.[item_shop_type.BORDER] as string) || null,
            badges: (userItems?.[item_shop_type.BADGE] as string[]) || [],
          },
          images: post.images.map((img) => ({
            id: img.image.id,
            url: `${this.baseUrl}/uploads/${img.image.url}`,
          })),
          isLikedByMe: existMyLike.some((like) => like.post_id === post.id),
          isRepostedByMe: isRepost.some((repost) => repost.post_id === post.id),
          isSavedByMe: isSaved.some((saved) => saved.post_id === post.id),
          likes: post.likes.length,
          comments_count: post._count.comments,
          repostedByUsers: repostOfMyFollowings
            .filter((repost) => repost.post_id === post.id)
            .slice(0, 2)
            .map((repost) => {
              const repItems = repostItemMap.get(repost.user.id);
              return {
                id: repost.user.id,
                username: repost.user.username,
                avatar_url: (repItems?.[item_shop_type.AVATAR] as string) || null,
                border_url: (repItems?.[item_shop_type.BORDER] as string) || null,
                badges: (repItems?.[item_shop_type.BADGE] as string[]) || [],
              };
            }),
        };
      }),
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const activeShopItems = await this.prismaService.user_shop_item.findMany({
      where: {
        user_id: post.user.id,
        is_active: true,
      },
      select: {
        shop_item: {
          select: {
            type: true,
            badge_name: true,
            item_image: {
              select: { url: true },
            },
          },
        },
      },
    });

    const itemUrls: { [key in item_shop_type]?: string | string[] } = {};
    activeShopItems.forEach((item) => {
      if (item.shop_item.type === item_shop_type.BADGE) {
        if (!itemUrls[item_shop_type.BADGE]) {
          itemUrls[item_shop_type.BADGE] = [];
        }
        if (item.shop_item.badge_name) {
          (itemUrls[item_shop_type.BADGE] as string[]).push(item.shop_item.badge_name);
        }
      } else if (item.shop_item.item_image?.url) {
        itemUrls[item.shop_item.type] = `${this.baseUrl}/uploads/${item.shop_item.item_image.url}`;
      }
    });

    return {
      id: post.id,
      text_content: post.text_content,
      created_at: post.created_at,
      user: {
        id: post.user.id,
        username: post.user.username,
        email: post.user.email,
        avatar_url: (itemUrls[item_shop_type.AVATAR] as string) || null,
        border_url: (itemUrls[item_shop_type.BORDER] as string) || null,
        badges: (itemUrls[item_shop_type.BADGE] as string[]) || [],
      },
      images: post.images.map((img) => ({
        id: img.image.id,
        url: `${this.baseUrl}/uploads/${img.image.url}`,
      })),
      comments_count: post._count.comments,
    };
  }

  async getPostsByUserId(
    userId: number,
    page?: number,
    page_size?: number,
  ): Promise<PaginatedPostResponse> {
    const existUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = page_size && page_size > 0 ? page_size : 10;
    const skip = (currentPage - 1) * pageSize;
    const totalItems = await this.prismaService.post.count({
      where: {
        user_id: userId,
      },
    });

    const posts = await this.prismaService.post.findMany({
      where: {
        user_id: userId,
      },
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
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: skip,
      take: pageSize,
    });

    const existMyLike = await this.prismaService.like.findMany({
      where: {
        post_id: {
          in: posts.map((post) => post.id),
        },
        user_id: userId,
      },
    });

    const isRepost = await this.prismaService.repost.findMany({
      where: {
        post_id: {
          in: posts.map((post) => post.id),
        },
        user_id: userId,
      },
    });
    const isSaved = await this.prismaService.saved_post.findMany({
      where: {
        post_id: {
          in: posts.map((post) => post.id),
        },
        user_id: userId,
      },
    });

    const activeShopItems = await this.prismaService.user_shop_item.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      select: {
        shop_item: {
          select: {
            type: true,
            badge_name: true,
            item_image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    const itemUrls: { [key in item_shop_type]?: string | string[] } = {};
    activeShopItems.forEach((item) => {
      if (item.shop_item.type === item_shop_type.BADGE) {
        if (!itemUrls[item_shop_type.BADGE]) {
          itemUrls[item_shop_type.BADGE] = [];
        }
        if (item.shop_item.badge_name) {
          (itemUrls[item_shop_type.BADGE] as string[]).push(item.shop_item.badge_name);
        }
      } else if (item.shop_item.item_image?.url) {
        itemUrls[item.shop_item.type] = `${this.baseUrl}/uploads/${item.shop_item.item_image.url}`;
      }
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      data: posts.map((post) => ({
        id: post.id,
        text_content: post.text_content,
        created_at: post.created_at,
        user: {
          id: post.user_id,
          username: post.user.username,
          email: post.user.email,
          avatar_url: (itemUrls[item_shop_type.AVATAR] as string) || null,
          border_url: (itemUrls[item_shop_type.BORDER] as string) || null,
          background_url: (itemUrls[item_shop_type.BACKGROUND] as string) || null,
          badges: (itemUrls[item_shop_type.BADGE] as string[]) || [],
        },
        images: post.images.map((img) => ({
          id: img.image.id,
          url: `${this.baseUrl}/uploads/${img.image.url}`,
        })),
        isLikedByMe: existMyLike.some((like) => like.post_id === post.id),
        isRepostedByMe: isRepost.some((repost) => repost.post_id === post.id),
        isSavedByMe: isSaved.some((saved) => saved.post_id === post.id),
        likes: post.likes.length,
        comments_count: post._count.comments,
      })),
      current_page: currentPage,
      total_items: totalItems,
      has_next_page: currentPage < totalPages,
      has_previous_page: currentPage > 1,
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

    const newImagesData: { url: string }[] = [];
    for (const file of files ?? []) {
      const imagePath = await this.imageService.saveImage(file, 'user-posts');
      newImagesData.push({ url: imagePath });
    }

    const deletedImageUrls = await this.prismaService.$transaction(
      async (tx) => {
        if (dto.text_content !== undefined) {
          await tx.post.update({
            where: { id },
            data: { text_content: dto.text_content },
          });
        }

        const postImages = await tx.post_image.findMany({
          where: { post_id: id },
          select: {
            image: {
              select: { id: true, url: true },
            },
          },
        });

        const currentImages = postImages.map((img) => img.image);

        const keepImageIds = Array.isArray(dto.keep_image_ids)
          ? dto.keep_image_ids.map(Number)
          : dto.keep_image_ids
            ? [Number(dto.keep_image_ids)]
            : [];

        const imagesToDelete = currentImages.filter(
          (img) => !keepImageIds.includes(img.id),
        );

        if (imagesToDelete.length > 0) {
          await tx.post_image.deleteMany({
            where: {
              post_id: id,
              image_id: {
                in: imagesToDelete.map((img) => img.id),
              },
            },
          });

          await tx.image.deleteMany({
            where: {
              id: {
                in: imagesToDelete.map((img) => img.id),
              },
            },
          });
        }

        if (newImagesData.length > 0) {
          await tx.image.createMany({
            data: newImagesData,
          });

          const images = await tx.image.findMany({
            where: { url: { in: newImagesData.map((i) => i.url) } },
            select: { id: true },
          });

          await tx.post_image.createMany({
            data: images.map((img) => ({
              post_id: id,
              image_id: img.id,
            })),
          });
        }

        return imagesToDelete.map((img) => img.url);
      },
    );

    await Promise.all(
      deletedImageUrls.map((url) => this.imageService.removeImage(url)),
    );

    return {
      success: true,
      message: 'Post updated successfully',
    };
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

    const imageUrls = await this.prismaService.$transaction(async (tx) => {
      const postRelatedImages = await tx.post_image.findMany({
        where: { post_id: id },
        select: {
          image: {
            select: { url: true },
          },
        },
      });

      await tx.post_image.deleteMany({ where: { post_id: id } });

      if (postRelatedImages.length > 0) {
        await tx.image.deleteMany({
          where: {
            url: {
              in: postRelatedImages.map((img) => img.image.url),
            },
          },
        });
      }

      await tx.post.delete({ where: { id } });

      return postRelatedImages.map((img) => img.image.url);
    });

    for (const url of imageUrls) {
      await this.imageService.removeImage(url);
    }

    return {
      success: true,
      message: `Post with ID ${id} has been deleted successfully`,
    };
  }
}
