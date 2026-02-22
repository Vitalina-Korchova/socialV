import { Module } from '@nestjs/common';
import { ShopItemService } from './shop_item.service';
import { ShopItemController } from './shop_item.controller';

@Module({
  controllers: [ShopItemController],
  providers: [ShopItemService],
})
export class ShopItemModule { }
