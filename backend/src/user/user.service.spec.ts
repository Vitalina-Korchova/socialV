import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { item_shop_type } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user_level_rules: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user with formatted data', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date(),
        amount_xp: 100,
        level: 1,
        amount_coins: 50,
        _count: {
          posts: 5,
          followers: 10,
          followings: 8,
        },
        user_shop_items: [
          {
            shop_item: {
              type: item_shop_type.AVATAR,
              item_image: { url: 'avatar.jpg' },
            },
          },
          {
            shop_item: {
              type: item_shop_type.BADGE,
              badge_name: 'Alpha Tester',
            },
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user_level_rules.findUnique.mockResolvedValue({
        required_experience: 200,
      });

      const result = await service.getUser(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(result.id).toEqual(userId);
      expect(result.avatar_url).toContain('avatar.jpg');
      expect(result.badges).toContain('Alpha Tester');
      expect(result.total_xp_required_level).toBe(200);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const dto = { email: 'newemail@gmail.com', username: 'newname' };
      const mockUser = { id: userId, email: 'test@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, ...dto });

      const result = await service.updateUser(userId, dto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: dto,
      });
      expect(result.success).toBe(true);
    });

    it('should throw ConflictException if email is already in use by another user', async () => {
      const userId = 1;
      const dto = { email: 'used@example.com', username: 'newname' };
      const currentUser = { id: userId, email: 'old@example.com' };
      const otherUser = { id: 2, email: 'used@example.com' };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(currentUser) // first call in updateUser logic
        .mockResolvedValueOnce(otherUser); // second call for email check

      await expect(service.updateUser(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUser(999, {
          username: '',
          email: '',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTopUsers', () => {
    it('should return top users excluding current user', async () => {
      const currentUserId = 1;
      const mockUsers = [
        {
          id: 2,
          username: 'top1',
          level: 10,
          user_shop_items: [
            {
              shop_item: {
                type: item_shop_type.AVATAR,
                item_image: { url: 'top1_avatar.jpg' },
              },
            },
          ],
          followings: [],
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getTopUsers(currentUserId);

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { not: currentUserId } },
        }),
      );
      expect(result.length).toBe(1);
      expect(result[0].username).toBe('top1');
      expect(result[0].avatar_url).toContain('top1_avatar.jpg');
    });
  });
});
