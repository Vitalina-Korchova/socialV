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
import { XpService } from 'src/xp/xp.service';
import { action_type_score } from '@prisma/client';

@Injectable()
export class FollowingService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly xpService: XpService,
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

      // Award XP
      await Promise.all([
        this.xpService.awardXp(followerId, action_type_score.START_FOLLOW),
        this.xpService.awardXp(followingId, action_type_score.RECEIVE_FOLLOW),
      ]);

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
              type: { in: ['AVATAR', 'BORDER'] },
            },
          },
          select: {
            shop_item: {
              select: {
                type: true,
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
      const avatarItem = user.user_shop_items.find(
        (item) => item.shop_item.type === 'AVATAR',
      );
      const borderItem = user.user_shop_items.find(
        (item) => item.shop_item.type === 'BORDER',
      );

      const avatarUrl = avatarItem?.shop_item?.item_image?.url
        ? `${this.baseUrl}/uploads/${avatarItem.shop_item.item_image.url}`
        : null;

      const borderUrl = borderItem?.shop_item?.item_image?.url
        ? `${this.baseUrl}/uploads/${borderItem.shop_item.item_image.url}`
        : null;

      return {
        id: user.id,
        username: user.username,
        avatar_url: avatarUrl,
        border_url: borderUrl,
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
              type: { in: ['AVATAR', 'BORDER'] },
            },
          },
          select: {
            shop_item: {
              select: {
                type: true,
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
      const avatarItem = user.user_shop_items.find(
        (item) => item.shop_item.type === 'AVATAR',
      );
      const borderItem = user.user_shop_items.find(
        (item) => item.shop_item.type === 'BORDER',
      );

      const avatarUrl = avatarItem?.shop_item?.item_image?.url
        ? `${this.baseUrl}/uploads/${avatarItem.shop_item.item_image.url}`
        : null;

      const borderUrl = borderItem?.shop_item?.item_image?.url
        ? `${this.baseUrl}/uploads/${borderItem.shop_item.item_image.url}`
        : null;

      return {
        id: user.id,
        username: user.username,
        avatar_url: avatarUrl,
        border_url: borderUrl,
      };
    });

    return { users };
  }
}
