import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShopItemService } from './shop_item.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SetShopItemActiveOrBuy } from './dto/shopt_item.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/shop-items')
export class ShopItemController {
  constructor(private readonly shopItemService: ShopItemService) { }

  @Get('')
  async getUserItems(
    @CurrentUser() user: { id: number },
    @Query('type') type: string,
  ) {
    return this.shopItemService.getAllUserShopItems(user.id, type);
  }

  @Post('set-active')
  async setActive(
    @CurrentUser() user: { id: number },
    @Body() dto: SetShopItemActiveOrBuy,
  ) {
    return this.shopItemService.setShopItemActive(
      user.id,
      dto.itemId,
      dto.type,
    );
  }

  @Post('set-badges-active')
  async setBadgesActive(
    @CurrentUser() user: { id: number },
    @Body('badgeIds') badgeIds: number[],
  ) {
    return this.shopItemService.setBadgesActive(user.id, badgeIds);
  }

  @Get('shop-items-to-buy-show')
  async getItemsToBuy(
    @CurrentUser() user: { id: number },
    @Query('type') type: string,
  ) {
    return this.shopItemService.getAllShopItemsToBuy(user.id, type);
  }

  @Post('buy-shop-item')
  async buyItem(
    @CurrentUser() user: { id: number },
    @Body() dto: SetShopItemActiveOrBuy,
  ) {
    return this.shopItemService.buyShopItem(user.id, dto.itemId, dto.type);
  }
}
