import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { item_shop_type } from '@prisma/client';
import { MyShopItemsResponse, ShopItemsToBuy } from './dto/shopt_item.dto';

@Injectable()
export class ShopItemService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('APP_URL');
  }

  async getAllUserShopItems(
    userId: number,
    type: string,
  ): Promise<MyShopItemsResponse[]> {
    const typeEnum = type.toUpperCase() as item_shop_type;
    if (!Object.values(item_shop_type).includes(typeEnum)) {
      throw new BadRequestException('Invalid item type.');
    }

    // Capture user's current level to sync free items
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    if (user) {
      const freeItemsToGrant = await this.prismaService.shop_item.findMany({
        where: {
          type: typeEnum,
          is_free: true,
          required_level: { lte: user.level },
          user_shop_items: {
            none: {
              user_id: userId,
            },
          },
        },
      });

      if (freeItemsToGrant.length > 0) {
        await this.prismaService.user_shop_item.createMany({
          data: freeItemsToGrant.map((item) => ({
            user_id: userId,
            shop_item_id: item.id,
            is_active: false,
          })),
        });
      }
    }
    //can be deleted in the future

    const userShopItems = await this.prismaService.user_shop_item.findMany({
      where: {
        user_id: userId,
        shop_item: {
          type: typeEnum,
        },
      },
      include: {
        shop_item: {
          include: {
            item_image: true,
          },
        },
      },
      orderBy: {
        shop_item: {
          required_level: 'asc',
        },
      },
    });

    return userShopItems.map((usi) => ({
      id: usi.shop_item.id,
      type: usi.shop_item.type,
      required_level: usi.shop_item.required_level,
      is_active: usi.is_active,
      badge_name: usi.shop_item.badge_name,
      image_url: usi.shop_item.item_image?.url
        ? `${this.baseUrl}/uploads/${usi.shop_item.item_image.url}`
        : null,
    }));
  }

  async setShopItemActive(userId: number, itemId: number, type: string) {
    const typeEnum = type.toUpperCase() as item_shop_type;

    if (!Object.values(item_shop_type).includes(typeEnum)) {
      throw new BadRequestException('Invalid item type.');
    }

    if (typeEnum === item_shop_type.BADGE) {
      throw new BadRequestException(
        'Use setBadgesActive for badge activation.',
      );
    }

    const item = await this.prismaService.user_shop_item.findUnique({
      where: {
        user_id_shop_item_id: {
          user_id: userId,
          shop_item_id: itemId,
        },
      },
      include: {
        shop_item: true,
      },
    });

    if (!item || item.shop_item.type !== typeEnum) {
      throw new NotFoundException(
        'Item not found or does not belong to the specified type.',
      );
    }

    await this.prismaService.user_shop_item.updateMany({
      where: {
        user_id: userId,
        shop_item: {
          type: typeEnum,
        },
      },
      data: {
        is_active: false,
      },
    });

    return this.prismaService.user_shop_item.update({
      where: {
        user_id_shop_item_id: {
          user_id: userId,
          shop_item_id: itemId,
        },
      },
      data: {
        is_active: true,
      },
    });
  }

  async setBadgesActive(userId: number, badgeIds: number[]) {
    if (badgeIds.length > 4) {
      throw new BadRequestException('You can only have up to 4 active badges.');
    }

    const ownBadges = await this.prismaService.user_shop_item.findMany({
      where: {
        user_id: userId,
        shop_item: {
          type: item_shop_type.BADGE,
        },
        shop_item_id: {
          in: badgeIds,
        },
      },
    });

    if (ownBadges.length !== badgeIds.length) {
      throw new BadRequestException('One or more badges are not owned by you.');
    }

    await this.prismaService.user_shop_item.updateMany({
      where: {
        user_id: userId,
        shop_item: {
          type: item_shop_type.BADGE,
        },
      },
      data: {
        is_active: false,
      },
    });

    // Activate selected badges
    return this.prismaService.user_shop_item.updateMany({
      where: {
        user_id: userId,
        shop_item: {
          id: {
            in: badgeIds,
          },
        },
      },
      data: {
        is_active: true,
      },
    });
  }

  async getAllShopItemsToBuy(
    userId: number,
    type: string,
  ): Promise<ShopItemsToBuy[]> {
    const typeEnum = type.toUpperCase() as item_shop_type;
    if (!Object.values(item_shop_type).includes(typeEnum)) {
      throw new BadRequestException('Invalid item type.');
    }

    const shopItems = await this.prismaService.shop_item.findMany({
      where: {
        type: typeEnum,
        is_free: false,
        user_shop_items: {
          none: {
            user_id: userId,
          },
        },
      },
      include: {
        item_image: true,
      },
      orderBy: {
        required_level: 'asc',
      },
    });

    return shopItems.map((item) => ({
      id: item.id,
      type: item.type,
      required_level: item.required_level,
      price_coins: item.price_coins,
      badge_name: item.badge_name,
      image_url: item.item_image?.url
        ? `${this.baseUrl}/uploads/${item.item_image.url}`
        : null,
    }));
  }

  async buyShopItem(userId: number, itemId: number, type: string) {
    const typeEnum = type.toUpperCase() as item_shop_type;
    if (!Object.values(item_shop_type).includes(typeEnum)) {
      throw new BadRequestException('Invalid item type.');
    }

    const item = await this.prismaService.shop_item.findUnique({
      where: { id: itemId },
    });

    if (!item || item.type !== typeEnum) {
      throw new NotFoundException('Item not found.');
    }

    const userOwnsItem = await this.prismaService.user_shop_item.findUnique({
      where: {
        user_id_shop_item_id: {
          user_id: userId,
          shop_item_id: itemId,
        },
      },
    });

    if (userOwnsItem) {
      throw new BadRequestException('You already own this item.');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found.');

    if (user.level < item.required_level) {
      throw new BadRequestException('Your level is too low to buy this item.');
    }

    if (user.amount_coins < item.price_coins) {
      throw new BadRequestException('You do not have enough coins.');
    }

    return this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          amount_coins: {
            decrement: item.price_coins,
          },
        },
      });

      return tx.user_shop_item.create({
        data: {
          user_id: userId,
          shop_item_id: itemId,
          is_active: false,
        },
      });
    });
  }
}
