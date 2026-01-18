import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Response } from 'express';
import { UserRequestUpdate } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUser(id: number, dto: UserRequestUpdate) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUserWithEmail = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        throw new ConflictException('Email already in use ');
      }
    }
    const updateUser = await this.prismaService.user.update({
      where: { id },
      data: dto,
    });
    return {
      success: true,
      message: 'User updated successfully',
      data: updateUser,
    };
  }
}
