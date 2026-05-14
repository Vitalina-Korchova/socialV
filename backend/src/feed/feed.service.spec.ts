import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostService } from 'src/post/post.service';
import { GeminiAiService } from 'src/gemini_ai/gemini_ai.service';

describe('FeedService', () => {
  let service: FeedService;

  const mockPrisma = {
    user: { update: jest.fn() },
    feed: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    post: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    following: { findMany: jest.fn() },
    like: { findMany: jest.fn() },
    comment: { findMany: jest.fn() },
    repost: { findMany: jest.fn() },
    saved_post: { findMany: jest.fn() },
  };

  const mockPostService = {
    buildPostsResponse: jest.fn(),
  };

  const mockAi = {
    sortedPost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PostService, useValue: mockPostService },
        { provide: GeminiAiService, useValue: mockAi },
      ],
    }).compile();

    service = module.get(FeedService);
    jest.clearAllMocks();
  });

  // ---------------- SEARCH BRANCH ----------------
  it('should return search results and bypass feed logic', async () => {
    mockPrisma.post.count.mockResolvedValue(1);
    mockPrisma.post.findMany.mockResolvedValue([{ id: 1 }]);
    mockPostService.buildPostsResponse.mockReturnValue({ data: [] });

    const result = await service.getFeed(1, 1, 10, 'test');

    expect(mockPrisma.post.findMany).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  // ---------------- NO FEED (fallback) ----------------
  it('should return latest posts if feed does not exist', async () => {
    mockPrisma.feed.findUnique.mockResolvedValue(null);
    mockPrisma.post.count.mockResolvedValue(2);
    mockPrisma.post.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockPostService.buildPostsResponse.mockReturnValue({ data: [] });

    const result = await service.getFeed(1, 1, 10);

    expect(mockPrisma.post.findMany).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  // ---------------- FEED EXISTS + PAGINATION ----------------
  it('should use feed recommended_post_ids', async () => {
    mockPrisma.feed.findUnique.mockResolvedValue({
      recommended_post_ids: [1, 2, 3],
    });

    mockPrisma.feed.update.mockResolvedValue({
      recommended_post_ids: [1, 2, 3],
    });

    mockPrisma.post.findMany.mockResolvedValue([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);

    mockPostService.buildPostsResponse.mockReturnValue({
      data: [],
    });

    const result = await service.getFeed(1, 1, 10);

    expect(result).toBeDefined();
  });

  // ---------------- AI GENERATION ----------------
  it('should generate feed using AI service', async () => {
    mockPrisma.feed.findUnique.mockResolvedValue(null);

    mockPrisma.like.findMany.mockResolvedValue([]);
    mockPrisma.comment.findMany.mockResolvedValue([]);
    mockPrisma.repost.findMany.mockResolvedValue([]);
    mockPrisma.saved_post.findMany.mockResolvedValue([]);
    mockPrisma.post.findMany.mockResolvedValue([]);

    mockPrisma.following.findMany.mockResolvedValue([]);

    mockAi.sortedPost.mockResolvedValue({
      ranked_post_ids: [10, 20],
    });

    await service.generateFeed(1);

    expect(mockAi.sortedPost).toHaveBeenCalled();
    expect(mockPrisma.feed.upsert).toHaveBeenCalled();
  });

  // ---------------- ALREADY UP TO DATE ----------------
  it('should skip generation if feed is fresh', async () => {
    mockPrisma.feed.findUnique.mockResolvedValue({
      updated_at: new Date(),
    });

    const result = await service.generateFeed(1);

    expect(result).toEqual({ message: 'Feed is up to date' });
  });
});
