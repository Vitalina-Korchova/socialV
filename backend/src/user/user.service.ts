import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { UserRequestUpdate, UserResponse } from './dto/user.dto';
import { item_shop_type } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('APP_URL');
  }

  async getUser(userId: number): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,

        _count: {
          select: {
            posts: true,
            followers: true,
            followings: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeAvatar = await this.prismaService.user_shop_item.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        shop_item: {
          type: item_shop_type.AVATAR,
        },
      },
      select: {
        shop_item: {
          select: {
            item_image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      posts_count: user._count.posts,
      followers_count: user._count.followings,
      followings_count: user._count.followers,
      avatar_url: `${this.baseUrl}/uploads/${activeAvatar?.shop_item?.item_image?.url ?? null}`,
    };
  }

  async updateUser(id: number, dto: UserRequestUpdate) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUserWithEmail = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        throw new ConflictException('Email already in use ');
      }
    }
    const updateUser = await this.prismaService.user.update({
      where: { id },
      data: dto,
    });
    return {
      success: true,
      message: 'User updated successfully',
      data: updateUser,
    };
  }
}
