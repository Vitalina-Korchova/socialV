import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentRequest, PaginatedCommentsResponse } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}
  async createComment(userId: number, dto: CommentRequest) {
    return await this.prismaService.comment.create({
      data: {
        text: dto.text,
        user_id: userId,
        post_id: Number(dto.post_id),
      },
    });
  }

  async getAllComments(
    postId: number,
    page?: number,
    page_size?: number,
  ): Promise<PaginatedCommentsResponse> {
    const existPost = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!existPost) throw new NotFoundException('Post not found');

    const currentPage = page && page > 0 ? page : 1;
    const pageSize = page_size && page_size > 0 ? page_size : 10;
    const skip = (currentPage - 1) * pageSize;
    const totalItems = await this.prismaService.comment.count({
      where: {
        post_id: postId,
      },
    });

    const comments = await this.prismaService.comment.findMany({
      where: {
        post_id: postId,
      },
      select: {
        id: true,
        text: true,
        created_at: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post_id: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: skip,
      take: pageSize,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      data: comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        user: comment.user,
        post_id: comment.post_id,
        created_at: comment.created_at,
      })),
      current_page: currentPage,
      total_items: totalItems,
      has_next_page: currentPage < totalPages,
      has_previous_page: currentPage > 1,
    };
  }

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
