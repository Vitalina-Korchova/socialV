import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FollowingService {
  constructor(private readonly prismaService: PrismaService) {}

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
      return { following: true };
    }
  }
}
