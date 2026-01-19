import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User, UserRequestUpdate } from './dto/user.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request) {
    return req.user;
  }

  @Put('user/:id')
  @HttpCode(HttpStatus.OK)
  updateUser(
    @Req() req: Request & { user: User },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UserRequestUpdate,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can update only your own profile');
    }

    return this.userService.updateUser(id, dto);
  }
}
