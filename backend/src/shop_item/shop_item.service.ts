import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopItemService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStandartTestAvatars() {
    return this.prismaService.shop_item.findMany({
      where: { type: 'AVATAR', is_free: true },
    });
  }
}
