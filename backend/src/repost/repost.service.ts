import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RepostService {
  constructor(private readonly prismaService: PrismaService) {}

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
      return { repost: true };
    }
  }
}
