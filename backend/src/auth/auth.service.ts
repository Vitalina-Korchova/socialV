import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { LoginRequest } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_TOKEN_ACCESS: StringValue;
  private readonly JWT_TOKEN_REFRESH: StringValue;
  constructor(
    private readonly prismaService: PrismaService,
    configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
    this.JWT_TOKEN_ACCESS =
      configService.getOrThrow<StringValue>('JWT_TOKEN_ACCESS');
    this.JWT_TOKEN_REFRESH =
      configService.getOrThrow<StringValue>('JWT_TOKEN_REFRESH');
  }
  async register(dto: RegisterRequest) {
    const { username, email, password } = dto;
    const existUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (existUser) {
      throw new ConflictException('User already exists with such email');
    }
    const user = await this.prismaService.user.create({
      data: {
        username,
        email,
        password: await hash(password),
      },
    });
    return this.generateTokens(user.id);
  }

  async login(dto: LoginRequest) {
    const { email, password } = dto;
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new NotFoundException('User not found');
    }

    return this.generateTokens(user.id);
  }

  private generateTokens(id: number) {
    const payload: { id: number } = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_TOKEN_ACCESS,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_TOKEN_REFRESH,
    });

    return { accessToken, refreshToken };
  }
}
