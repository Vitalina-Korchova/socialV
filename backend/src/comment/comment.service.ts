import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentRequest } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}
  async createComment(userId: number, dto: CommentRequest) {
    return await this.prismaService.comment.create({
      data: {
        text: dto.text,
        user_id: userId,
        post_id: dto.post_id,
      },
    });
  }
  async getAllComments(postId: number) {}
  async deleteComment(commentId: number) {
    const existComment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });
    if (!existComment) throw new NotFoundException('Comment not found');
    return await this.prismaService.comment.delete({
      where: { id: commentId },
    });
  }
}
