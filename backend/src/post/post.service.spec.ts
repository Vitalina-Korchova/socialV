import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { XpService } from '../xp/xp.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { action_type_score } from '@prisma/client';
import { ImageService } from 'src/image/image.service';

describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;
  let imageService: ImageService;
  let configService: ConfigService;
  let xpService: XpService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    image: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    post_image: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    user_shop_item: {
      findMany: jest.fn(),
    },
    like: {
      findMany: jest.fn(),
    },
    repost: {
      findMany: jest.fn(),
    },
    saved_post: {
      findMany: jest.fn(),
    },
    following: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockImageService = {
    saveImage: jest.fn(),
    removeImage: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const mockXpService = {
    awardXp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ImageService, useValue: mockImageService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: XpService, useValue: mockXpService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);
    imageService = module.get<ImageService>(ImageService);
    configService = module.get<ConfigService>(ConfigService);
    xpService = module.get<XpService>(XpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post without images', async () => {
      const userId = 1;
      const dto = { text_content: 'Hello #world' };
      const files = [];
      const mockPost = {
        id: 1,
        text_content: dto.text_content,
        user_id: userId,
        hashtags: '#world',
      };

      mockPrismaService.post.create.mockResolvedValue(mockPost);

      const result = await service.createPost(userId, dto as any, files);

      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: {
          text_content: dto.text_content,
          hashtags: '#world',
          user_id: userId,
        },
      });
      expect(xpService.awardXp).toHaveBeenCalledWith(
        userId,
        action_type_score.CREATE_POST,
      );
      expect(result).toEqual(mockPost);
    });

    it('should create a post with images', async () => {
      const userId = 1;
      const dto = { text_content: 'Post with image #cool' };
      const files = [{ originalname: 'test.jpg' } as any];
      const mockPost = {
        id: 1,
        text_content: dto.text_content,
        user_id: userId,
        hashtags: ['cool'],
      };
      const mockImage = { id: 10, url: 'path/to/image.jpg' };

      mockPrismaService.post.create.mockResolvedValue(mockPost);
      mockImageService.saveImage.mockResolvedValue('path/to/image.jpg');
      mockPrismaService.image.create.mockResolvedValue(mockImage);
      mockPrismaService.post_image.create.mockResolvedValue({});

      await service.createPost(userId, dto as any, files);

      expect(imageService.saveImage).toHaveBeenCalledWith(
        files[0],
        'user-posts',
      );
      expect(prismaService.image.create).toHaveBeenCalledWith({
        data: { url: 'path/to/image.jpg' },
      });
      expect(prismaService.post_image.create).toHaveBeenCalledWith({
        data: { post_id: mockPost.id, image_id: mockImage.id },
      });
    });
  });

  describe('getPostById', () => {
    it('should return a post with user details and shop items', async () => {
      const postId = 1;
      const mockPost = {
        id: postId,
        text_content: 'Post content',
        created_at: new Date(),
        user_id: 2,
        images: [{ image: { id: 1, url: 'image1.jpg' } }],
        user: { id: 2, username: 'user1', email: 'user1@example.com' },
        _count: { comments: 5 },
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.user_shop_item.findMany.mockResolvedValue([]);

      const result = await service.getPostById(postId);

      expect(prismaService.post.findUnique).toHaveBeenCalled();
      expect(result.id).toEqual(postId);
      expect(result.comments_count).toEqual(5);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.getPostById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllPosts', () => {
    it('should return paginated posts', async () => {
      const userId = 1;
      const mockPosts = [
        {
          id: 1,
          text_content: 'test',
          user: { id: 2, username: 'u2', email: 'e2' },
          images: [],
          likes: [],
          saved_post: [],
          reposts: [],
          _count: { comments: 0 },
        },
      ];

      mockPrismaService.post.count.mockResolvedValue(1);
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.like.findMany.mockResolvedValue([]);
      mockPrismaService.repost.findMany.mockResolvedValue([]);
      mockPrismaService.saved_post.findMany.mockResolvedValue([]);
      mockPrismaService.following.findMany.mockResolvedValue([]);
      mockPrismaService.user_shop_item.findMany.mockResolvedValue([]);

      const result = await service.getAllPosts(userId);

      expect(result.data.length).toBe(1);
      expect(result.total_items).toBe(1);
      expect(prismaService.post.findMany).toHaveBeenCalled();
    });
  });

  describe('getPostsByUserId', () => {
    it('should return posts for a specific user', async () => {
      const userId = 2;
      const currentUserId = 1;
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.post.count.mockResolvedValue(1);
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.like.findMany.mockResolvedValue([]);
      mockPrismaService.repost.findMany.mockResolvedValue([]);
      mockPrismaService.saved_post.findMany.mockResolvedValue([]);
      mockPrismaService.user_shop_item.findMany.mockResolvedValue([]);

      const result = await service.getPostsByUserId(userId, currentUserId);

      expect(result.data).toBeDefined();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if target user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getPostsByUserId(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePost', () => {
    it('should update post text and handle images', async () => {
      const postId = 1;
      const userId = 1;
      const dto = { text_content: 'updated text', keep_image_ids: [1] };
      const files = [] as any;
      const mockPost = { id: postId, user_id: userId };
      const currentImages = [
        { image: { id: 1, url: 'keep.jpg' } },
        { image: { id: 2, url: 'delete.jpg' } },
      ];

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post_image.findMany.mockResolvedValue(currentImages);

      const result = await service.updatePost(postId, userId, dto, files);

      expect(mockPrismaService.post.update).toHaveBeenCalled();
      expect(mockPrismaService.post_image.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.image.deleteMany).toHaveBeenCalled();
      expect(imageService.removeImage).toHaveBeenCalledWith('delete.jpg');
      expect(result.success).toBe(true);
    });
  });

  describe('removePost', () => {
    it('should delete post and its images', async () => {
      const userId = 1;
      const postId = 1;
      const mockPost = { id: postId, user_id: userId };
      const mockPostImages = [{ image: { url: 'img1.jpg' } }];

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post_image.findMany.mockResolvedValue(mockPostImages);

      const result = await service.removePost(postId, userId);

      expect(prismaService.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(imageService.removeImage).toHaveBeenCalledWith('img1.jpg');
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const userId = 1;
      const postId = 1;
      const mockPost = { id: postId, user_id: 2 };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(service.removePost(postId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
