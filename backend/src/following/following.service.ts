import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowingResponseUsers } from './dto/following.dto';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from 'src/notifications/notifications.service';
import { notificationsType } from 'src/notifications/dto/notifications.dto';

@Injectable()
export class FollowingService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('APP_URL');
  }

  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }
    const existFollowingUser = await this.prismaService.user.findUnique({
      where: {
        id: followingId,
      },
    });

    if (!existFollowingUser)
      throw new NotFoundException('Following user not found');

    const alreadyFollowed = await this.prismaService.following.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });

    if (alreadyFollowed) {
      await this.prismaService.following.delete({
        where: {
          follower_id_following_id: {
            follower_id: followerId,
            following_id: followingId,
          },
        },
      });
      return { following: false };
    } else {
      await this.prismaService.following.create({
        data: {
          follower_id: followerId,
          following_id: followingId,
        },
      });

      // Create notification
      await this.notificationsService.createNotification(
        followerId,
        followingId,
        notificationsType.FOLLOW,
      );

      return { following: true };
    }
  }

  async isUserFollowing(
    followerId: number,
    followingId: number,
  ): Promise<boolean> {
    const following = await this.prismaService.following.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
      select: { following_id: true },
    });

    return !!following;
  }

  async getAllFollowingUsers(userId: number): Promise<FollowingResponseUsers> {
    const followingUsers = await this.prismaService.following.findMany({
      where: {
        follower_id: userId,
      },
      select: {
        following_id: true,
      },
    });

    const dataUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: followingUsers.map((user) => user.following_id),
        },
      },
      select: {
        id: true,
        username: true,
        user_shop_items: {
          where: {
            is_active: true,
            shop_item: {
              type: 'AVATAR',
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
        },
      },
    });

    const users = dataUsers.map((user) => {
      const firstItem = user.user_shop_items[0];
      const avatarUrl = firstItem?.shop_item?.item_image?.url
        ? `${this.baseUrl}/uploads/${firstItem.shop_item.item_image.url}`
        : null;

      return {
        id: user.id,
        username: user.username,
        avatar_url: avatarUrl,
      };
    });

    return { users };
  }

  async getAllFollowersUsers(userId: number): Promise<FollowingResponseUsers> {
    const followers = await this.prismaService.following.findMany({
      where: {
        following_id: userId,
      },
      select: {
        follower_id: true,
      },
    });

    const dataUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          in: followers.map((f) => f.follower_id),
        },
      },
      select: {
        id: true,
        username: true,
        user_shop_items: {
          where: {
            is_active: true,
            shop_item: {
              type: 'AVATAR',
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
        },
      },
    });

    const users = dataUsers.map((user) => {
      const firstItem = user.user_shop_items[0];
      const avatarUrl = firstItem?.shop_item?.item_image?.url
        ? `${this.baseUrl}/uploads/${firstItem.shop_item.item_image.url}`
        : null;

      return {
        id: user.id,
        username: user.username,
        avatar_url: avatarUrl,
      };
    });

    return { users };
  }
}
