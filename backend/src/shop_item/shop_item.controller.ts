import { Controller, UseGuards } from '@nestjs/common';
import { ShopItemService } from './shop_item.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('shop-item')
export class ShopItemController {
  constructor(private readonly shopItemService: ShopItemService) { }
}
