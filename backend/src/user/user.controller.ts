import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserRequestUpdate } from './dto/user.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: { id: number }) {
    return this.userService.getUser(user.id);
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  updateUser(
    @CurrentUser() user: { id: number },
    @Body() dto: UserRequestUpdate,
  ) {
    return this.userService.updateUser(user.id, dto);
  }
}
