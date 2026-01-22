import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SavedPostService {
  constructor(private readonly prismaService: PrismaService) {}

  async toggleSavedPost(postId: number, userId: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const alreadySavedPost = await this.prismaService.saved_post.findUnique({
      where: {
        user_id_post_id: { post_id: postId, user_id: userId },
      },
    });

    if (alreadySavedPost) {
      await this.prismaService.saved_post.delete({
        where: {
          user_id_post_id: { post_id: postId, user_id: userId },
        },
      });
      return { saved_post: false };
    } else {
      await this.prismaService.saved_post.create({
        data: {
          post_id: postId,
          user_id: userId,
        },
      });
      return { saved_post: true };
    }
  }
}
