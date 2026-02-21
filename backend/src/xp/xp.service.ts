import { Injectable } from '@nestjs/common';
import { action_type_score } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class XpService {
  constructor(private readonly prismaService: PrismaService) {}

  async awardXp(userId: number, action: action_type_score): Promise<void> {
    try {
      const rule = await this.prismaService.xp_rules.findFirst({
        where: { type: action },
      });

      if (!rule || rule.xp_amount <= 0) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const dailyCount = await this.getDailyActionCount(
        userId,
        action,
        todayStart,
      );

      if (dailyCount >= rule.daily_limit) return;

      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          amount_xp: { increment: rule.xp_amount },
          amount_coins: { increment: rule.coins_amount },
        },
      });

      await this.checkAndLevelUp(userId);
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }

  private async checkAndLevelUp(userId: number): Promise<void> {
    let user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { level: true, amount_xp: true },
    });

    if (!user) return;

    while (true) {
      const nextLevelRule =
        await this.prismaService.user_level_rules.findUnique({
          where: { level: user.level + 1 },
        });

      if (!nextLevelRule) break;

      if (user.amount_xp < nextLevelRule.required_experience) break;

      user = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          level: { increment: 1 },
          amount_coins: { increment: nextLevelRule.reward_coins },
        },
        select: { level: true, amount_xp: true },
      });

      await this.prismaService.notification.create({
        data: {
          sender_id: userId,
          recipient_id: userId,
          notification_type: 'LVLUP',
        },
      });
    }
  }

  private async getDailyActionCount(
    userId: number,
    action: action_type_score,
    since: Date,
  ): Promise<number> {
    switch (action) {
      case action_type_score.CREATE_POST:
        return this.prismaService.post.count({
          where: { user_id: userId, created_at: { gte: since } },
        });

      case action_type_score.SET_LIKE:
        return this.prismaService.like.count({
          where: { user_id: userId, created_at: { gte: since } },
        });

      case action_type_score.RECEIVE_LIKE:
        return this.prismaService.like.count({
          where: {
            post: { user_id: userId },
            created_at: { gte: since },
          },
        });

      case action_type_score.SET_REPOST:
        return this.prismaService.repost.count({
          where: { user_id: userId, created_at: { gte: since } },
        });

      case action_type_score.RECEIVE_REPOST:
        return this.prismaService.repost.count({
          where: {
            post: { user_id: userId },
            created_at: { gte: since },
          },
        });

      case action_type_score.SET_COMMENT:
        return this.prismaService.comment.count({
          where: { user_id: userId, created_at: { gte: since } },
        });

      case action_type_score.RECEIVE_COMMENT:
        return this.prismaService.comment.count({
          where: {
            post: { user_id: userId },
            created_at: { gte: since },
          },
        });

      case action_type_score.START_FOLLOW:
        return this.prismaService.following.count({
          where: { follower_id: userId, created_at: { gte: since } },
        });

      case action_type_score.RECEIVE_FOLLOW:
        return this.prismaService.following.count({
          where: { following_id: userId, created_at: { gte: since } },
        });

      case action_type_score.CREATE_MESSAGE:
        return this.prismaService.message.count({
          where: { sender_id: userId, created_at: { gte: since } },
        });

      case action_type_score.RECEIVE_MESSAGE:
        return this.prismaService.message.count({
          where: {
            created_at: { gte: since },
            sender_id: { not: userId },
            chat: {
              OR: [{ first_user_id: userId }, { second_user_id: userId }],
            },
          },
        });

      case action_type_score.SET_BOOKMARK:
        return this.prismaService.saved_post.count({
          where: { user_id: userId, created_at: { gte: since } },
        });

      default:
        return 0;
    }
  }
}
