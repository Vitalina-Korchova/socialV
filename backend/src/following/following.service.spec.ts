import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FollowingService } from './following.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from 'src/notifications/notifications.service';
import { XpService } from 'src/xp/xp.service';
import { notificationsType } from 'src/notifications/dto/notifications.dto';
import { action_type_score } from '@prisma/client';

describe('FollowingService', () => {
  let service: FollowingService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    following: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  const mockXpService = {
    awardXp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: XpService,
          useValue: mockXpService,
        },
      ],
    }).compile();

    service = module.get<FollowingService>(FollowingService);

    jest.clearAllMocks();
  });

  describe('toggleFollow', () => {
    it('should throw if user tries to follow himself', async () => {
      await expect(service.toggleFollow(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if following user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.toggleFollow(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should unfollow user if already followed', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 2,
      });

      mockPrismaService.following.findUnique.mockResolvedValue({
        follower_id: 1,
        following_id: 2,
      });

      mockPrismaService.following.delete.mockResolvedValue({});

      const result = await service.toggleFollow(1, 2);

      expect(mockPrismaService.following.delete).toHaveBeenCalled();
      expect(result).toEqual({
        following: false,
      });
    });

    it('should follow user and create notification + xp', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 2,
      });

      mockPrismaService.following.findUnique.mockResolvedValue(null);

      mockPrismaService.following.create.mockResolvedValue({});

      const result = await service.toggleFollow(1, 2);

      expect(mockPrismaService.following.create).toHaveBeenCalledWith({
        data: {
          follower_id: 1,
          following_id: 2,
        },
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        1,
        2,
        notificationsType.FOLLOW,
      );

      expect(mockXpService.awardXp).toHaveBeenCalledWith(
        1,
        action_type_score.START_FOLLOW,
      );

      expect(mockXpService.awardXp).toHaveBeenCalledWith(
        2,
        action_type_score.RECEIVE_FOLLOW,
      );

      expect(result).toEqual({
        following: true,
      });
    });
  });

  describe('isUserFollowing', () => {
    it('should return true if following exists', async () => {
      mockPrismaService.following.findUnique.mockResolvedValue({
        following_id: 2,
      });

      const result = await service.isUserFollowing(1, 2);

      expect(result).toBe(true);
    });

    it('should return false if following does not exist', async () => {
      mockPrismaService.following.findUnique.mockResolvedValue(null);

      const result = await service.isUserFollowing(1, 2);

      expect(result).toBe(false);
    });
  });

  describe('getAllFollowingUsers', () => {
    it('should return formatted following users', async () => {
      mockPrismaService.following.findMany.mockResolvedValue([
        {
          following_id: 2,
        },
      ]);

      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 2,
          username: 'john',
          user_shop_items: [
            {
              shop_item: {
                type: 'AVATAR',
                item_image: {
                  url: 'avatar.png',
                },
              },
            },
            {
              shop_item: {
                type: 'BORDER',
                item_image: {
                  url: 'border.png',
                },
              },
            },
          ],
        },
      ]);

      const result = await service.getAllFollowingUsers(1);

      expect(result).toEqual({
        users: [
          {
            id: 2,
            username: 'john',
            avatar_url: 'http://localhost:3000/uploads/avatar.png',
            border_url: 'http://localhost:3000/uploads/border.png',
          },
        ],
      });
    });
  });

  describe('getAllFollowersUsers', () => {
    it('should return formatted followers users', async () => {
      mockPrismaService.following.findMany.mockResolvedValue([
        {
          follower_id: 3,
        },
      ]);

      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 3,
          username: 'kate',
          user_shop_items: [],
        },
      ]);

      const result = await service.getAllFollowersUsers(1);

      expect(result).toEqual({
        users: [
          {
            id: 3,
            username: 'kate',
            avatar_url: null,
            border_url: null,
          },
        ],
      });
    });
  });
});
