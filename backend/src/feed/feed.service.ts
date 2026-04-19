import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  PostsActionDTO,
  PostsContentDTO,
} from 'src/gemini_ai/dto/gemini_ai.dto';
import { GeminiAiService } from 'src/gemini_ai/gemini_ai.service';

import { PaginatedPostResponse } from 'src/post/dto/post.dto';
import { PostService } from 'src/post/post.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postService: PostService,
    private readonly geminiAiService: GeminiAiService,
  ) {}

  async getFeed(
    userId: number,
    page?: number,
    page_size?: number,
    search?: string,
  ): Promise<PaginatedPostResponse> {
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = page_size && page_size > 0 ? page_size : 10;

    // update last_visit
    await this.prismaService.user.update({
      where: { id: userId },
      data: { last_visit: new Date() },
    });

    //searching
    if (search) {
      const searchWhere: any = {
        OR: [
          { text_content: { contains: search, mode: 'insensitive' } },
          { hashtags: { contains: search, mode: 'insensitive' } },
        ],
      };

      const totalItems = await this.prismaService.post.count({
        where: searchWhere,
      });

      const posts = await this.prismaService.post.findMany({
        where: searchWhere,
        orderBy: { created_at: 'desc' },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          text_content: true,
          created_at: true,
          user_id: true,
          images: { select: { image: { select: { id: true, url: true } } } },
          user: { select: { id: true, username: true, email: true } },
          likes: true,
          saved_post: true,
          reposts: true,
          _count: { select: { comments: true } },
        },
      });

      return this.postService.buildPostsResponse(
        posts,
        userId,
        currentPage,
        pageSize,
        totalItems,
      );
    }

    let userFeed = await this.prismaService.feed.findUnique({
      where: { user_id: userId },
    });

    // якщо feed НЕ існує → просто останні пости
    if (!userFeed) {
      const totalItems = await this.prismaService.post.count();

      const posts = await this.prismaService.post.findMany({
        orderBy: { created_at: 'desc' },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          text_content: true,
          created_at: true,
          user_id: true,
          user: { select: { id: true, username: true, email: true } },
          images: { select: { image: { select: { id: true, url: true } } } },
          likes: true,
          saved_post: true,
          reposts: true,
          _count: { select: { comments: true } },
        },
      });

      return this.postService.buildPostsResponse(
        posts,
        userId,
        currentPage,
        pageSize,
        totalItems,
      );
    }

    // shuffle тільки для 1 сторінки
    if (currentPage === 1) {
      const shuffled = [...userFeed.recommended_post_ids];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      userFeed = await this.prismaService.feed.update({
        where: { user_id: userId },
        data: { recommended_post_ids: shuffled },
      });
    }

    const paginatedIds = userFeed.recommended_post_ids.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

    const posts = await this.prismaService.post.findMany({
      where: { id: { in: paginatedIds } },
      select: {
        id: true,
        text_content: true,
        created_at: true,
        user_id: true,
        user: { select: { id: true, username: true, email: true } },
        images: { select: { image: { select: { id: true, url: true } } } },
        likes: true,
        saved_post: true,
        reposts: true,
        _count: { select: { comments: true } },
      },
    });

    const sortedPosts = paginatedIds
      .map((id) => posts.find((p) => p.id === id))
      .filter(Boolean);

    return this.postService.buildPostsResponse(
      sortedPosts,
      userId,
      currentPage,
      pageSize,
      userFeed.recommended_post_ids.length,
    );
  }

  async generateFeed(userId: number) {
    const userFeed = await this.prismaService.feed.findUnique({
      where: { user_id: userId },
    });

    const needsUpdate =
      !userFeed ||
      userFeed.updated_at.getTime() + 24 * 60 * 60 * 1000 < Date.now();

    if (!needsUpdate) {
      return { message: 'Feed is up to date' };
    }

    //user actions
    const [
      recentLikes,
      recentComments,
      recentReposts,
      recentSaved,
      personalPosts,
    ] = await Promise.all([
      this.prismaService.like.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          post: { include: { images: { include: { image: true } } } },
        },
      }),
      this.prismaService.comment.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          post: { include: { images: { include: { image: true } } } },
        },
      }),
      this.prismaService.repost.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          post: { include: { images: { include: { image: true } } } },
        },
      }),
      this.prismaService.saved_post.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          post: { include: { images: { include: { image: true } } } },
        },
      }),
      this.prismaService.post.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          images: { include: { image: true } },
        },
      }),
    ]);

    //helpers
    const getImageData = (imageUrl: string) => {
      try {
        const fullPath = path.join(process.cwd(), 'uploads', imageUrl);
        if (!fs.existsSync(fullPath)) return null;
        const data = fs.readFileSync(fullPath).toString('base64');
        return { mimeType: 'image/webp', data };
      } catch {
        return null;
      }
    };

    const mapPostToAction = (post: any, action: string): PostsActionDTO => ({
      action,
      text: post.text_content,
      tags: post.hashtags ? post.hashtags.split(',').filter(Boolean) : [],
      images:
        post.images
          ?.map((img: any) => getImageData(img.image.url))
          .filter(Boolean) || [],
    });

    const recentActionsDTO: PostsActionDTO[] = [
      ...recentLikes.map((l) => mapPostToAction(l.post, 'like')),
      ...recentComments.map((c) => mapPostToAction(c.post, 'comment')),
      ...recentReposts.map((r) => mapPostToAction(r.post, 'repost')),
      ...recentSaved.map((s) => mapPostToAction(s.post, 'bookmark')),
      ...personalPosts.map((p) => mapPostToAction(p, 'create_post')),
    ];

    //followinf posts
    const followingIds = (
      await this.prismaService.following.findMany({
        where: { follower_id: userId },
        select: { following_id: true },
      })
    ).map((f) => f.following_id);

    const followerPostsPrisma = await this.prismaService.post.findMany({
      where: { user_id: { in: followingIds } },
      take: 50,
      orderBy: { created_at: 'desc' },
      include: {
        images: { include: { image: true } },
      },
    });

    const mapPostToContent = (post: any): PostsContentDTO => ({
      id: post.id,
      text: post.text_content,
      tags: post.hashtags ? post.hashtags.split(',').filter(Boolean) : [],
      images:
        post.images
          ?.map((img: any) => getImageData(img.image.url))
          .filter(Boolean) || [],
    });

    const follower_posts = followerPostsPrisma.map(mapPostToContent);

    //general posts
    const generalPostsPrisma = await this.prismaService.post.findMany({
      take: 250,
      orderBy: { created_at: 'desc' },
      where: {
        id: {
          notIn: personalPosts.map((p) => p.id),
        },
      },
    });

    const general_posts: PostsContentDTO[] = generalPostsPrisma.map((p) => ({
      id: p.id,
      text: p.text_content,
      tags: p.hashtags ? p.hashtags.split(',').filter(Boolean) : [],
      images: [], // оптимізація
    }));

    //ai
    const aiResponse = await this.geminiAiService.sortedPost({
      recent_actions: recentActionsDTO,
      follower_posts,
      general_posts,
    });

    const allKnownIds = Array.from(
      new Set([
        ...follower_posts.map((p) => p.id),
        ...general_posts.map((p) => p.id),
      ]),
    );

    const rankedIds = aiResponse?.ranked_post_ids ?? [];
    const rankedSet = new Set(rankedIds);
    const missedIds = allKnownIds.filter((id) => !rankedSet.has(id));

    const sortedPostIds = Array.from(new Set([...rankedIds, ...missedIds]));

    //saving
    await this.prismaService.feed.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        recommended_post_ids: sortedPostIds,
      },
      update: {
        recommended_post_ids: sortedPostIds,
        updated_at: new Date(),
      },
    });

    return { message: 'Feed generated' };
  }
}
