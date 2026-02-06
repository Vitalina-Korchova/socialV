import { Controller } from '@nestjs/common';
import { ShopItemService } from './shop_item.service';

@Controller('shop-item')
export class ShopItemController {
  constructor(private readonly shopItemService: ShopItemService) {}
}
