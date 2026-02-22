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
        amount_xp: true,
        level: true,
        amount_coins: true,

        _count: {
          select: {
            posts: true,
            followers: true,
            followings: true,
          },
        },

        user_shop_items: {
          where: { is_active: true },
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
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const getImageUrl = (type: item_shop_type) => {
      const item = user.user_shop_items.find((i) => i.shop_item.type === type);
      return item?.shop_item?.item_image?.url
        ? `${this.baseUrl}/uploads/${item.shop_item.item_image.url}`
        : null;
    };

    const totalXpRequiredLvlUp = await this.prismaService.user_level_rules.findUnique(
      {
        where: {
          level: user.level + 1,
        },
        select: {
          required_experience: true,
        },
      },
    );

    const activeBadges = user.user_shop_items
      .filter((i) => i.shop_item.type === item_shop_type.BADGE)
      .map((i) => i.shop_item.badge_name)
      .filter((name): name is string => !!name);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      posts_count: user._count.posts,
      followers_count: user._count.followings,
      followings_count: user._count.followers,
      avatar_url: getImageUrl(item_shop_type.AVATAR),
      background_url: getImageUrl(item_shop_type.BACKGROUND),
      border_url: getImageUrl(item_shop_type.BORDER),
      amount_xp: user.amount_xp,
      level: user.level,
      amount_coins: user.amount_coins,
      total_xp_required_level: totalXpRequiredLvlUp?.required_experience || 0,
      badges: activeBadges,
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
