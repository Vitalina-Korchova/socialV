import { Test, TestingModule } from '@nestjs/testing';
import { ShopItemService } from './shop_item.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { item_shop_type } from '@prisma/client';

describe('ShopItemService', () => {
  let service: ShopItemService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    shop_item: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    user_shop_item: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopItemService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ShopItemService>(ShopItemService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUserShopItems', () => {
    it('should return user shop items and grant free ones', async () => {
      const userId = 1;
      const type = 'AVATAR';
      const mockUser = { id: userId, level: 5 };
      const mockFreeItems = [{ id: 10, type: item_shop_type.AVATAR }];
      const mockUserShopItems = [
        {
          shop_item: {
            id: 10,
            type: item_shop_type.AVATAR,
            required_level: 1,
            item_image: { url: 'img.jpg' },
          },
          is_active: true,
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.shop_item.findMany.mockResolvedValue(mockFreeItems);
      mockPrismaService.user_shop_item.findMany.mockResolvedValue(mockUserShopItems);

      const result = await service.getAllUserShopItems(userId, type);

      expect(prismaService.shop_item.findMany).toHaveBeenCalled();
      expect(prismaService.user_shop_item.createMany).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].image_url).toContain('img.jpg');
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(service.getAllUserShopItems(1, 'INVALID')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('setShopItemActive', () => {
    it('should set an item active and deactivate others of the same type', async () => {
      const userId = 1;
      const itemId = 10;
      const type = 'AVATAR';
      const mockItem = { shop_item: { type: item_shop_type.AVATAR } };

      mockPrismaService.user_shop_item.findUnique.mockResolvedValue(mockItem);

      await service.setShopItemActive(userId, itemId, type);

      expect(prismaService.user_shop_item.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId, shop_item: { type: item_shop_type.AVATAR } },
          data: { is_active: false },
        }),
      );
      expect(prismaService.user_shop_item.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id_shop_item_id: { user_id: userId, shop_item_id: itemId } },
          data: { is_active: true },
        }),
      );
    });

    it('should throw BadRequestException if trying to activate badge through this method', async () => {
      await expect(service.setShopItemActive(1, 1, 'BADGE')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('setBadgesActive', () => {
    it('should activate up to 4 badges', async () => {
      const userId = 1;
      const badgeIds = [1, 2];
      const mockOwnBadges = [{ id: 1 }, { id: 2 }];

      mockPrismaService.user_shop_item.findMany.mockResolvedValue(mockOwnBadges);

      await service.setBadgesActive(userId, badgeIds);

      expect(prismaService.user_shop_item.updateMany).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if more than 4 badges', async () => {
      await expect(
        service.setBadgesActive(1, [1, 2, 3, 4, 5]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('buyShopItem', () => {
    it('should allow buying an item if user has enough coins and level', async () => {
      const userId = 1;
      const itemId = 10;
      const mockItem = {
        id: itemId,
        type: item_shop_type.AVATAR,
        price_coins: 100,
        required_level: 2,
      };
      const mockUser = { id: userId, level: 5, amount_coins: 200 };

      mockPrismaService.shop_item.findUnique.mockResolvedValue(mockItem);
      mockPrismaService.user_shop_item.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.buyShopItem(userId, itemId, 'AVATAR');

      expect(prismaService.user.update).toHaveBeenCalled();
      expect(prismaService.user_shop_item.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already owned', async () => {
      mockPrismaService.shop_item.findUnique.mockResolvedValue({
        type: item_shop_type.AVATAR,
      });
      mockPrismaService.user_shop_item.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.buyShopItem(1, 10, 'AVATAR')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if coins are insufficient', async () => {
      mockPrismaService.shop_item.findUnique.mockResolvedValue({
        id: 1,
        type: item_shop_type.AVATAR,
        price_coins: 100,
        required_level: 1,
      });
      mockPrismaService.user_shop_item.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue({
        level: 5,
        amount_coins: 50,
      });

      await expect(service.buyShopItem(1, 1, 'AVATAR')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
