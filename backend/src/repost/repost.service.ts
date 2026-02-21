import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { notificationsType } from 'src/notifications/dto/notifications.dto';
import { XpService } from 'src/xp/xp.service';
import { action_type_score } from '@prisma/client';

@Injectable()
export class RepostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly xpService: XpService,
  ) { }

  async toggleRepost(postId: number, userId: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const alreadyReposted = await this.prismaService.repost.findUnique({
      where: {
        user_id_post_id: { post_id: postId, user_id: userId },
      },
    });

    if (alreadyReposted) {
      await this.prismaService.repost.delete({
        where: {
          user_id_post_id: { post_id: postId, user_id: userId },
        },
      });
      return { repost: false };
    } else {
      await this.prismaService.repost.create({
        data: {
          post_id: postId,
          user_id: userId,
        },
      });

      // Create notification
      await this.notificationsService.createNotification(
        userId,
        post.user_id,
        notificationsType.REPOST,
        postId,
      );

      // Award XP
      await Promise.all([
        this.xpService.awardXp(userId, action_type_score.SET_REPOST),
        this.xpService.awardXp(post.user_id, action_type_score.RECEIVE_REPOST),
      ]);

      return { repost: true };
    }
  }
}
