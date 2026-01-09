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
import type { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly JWT_TOKEN_ACCESS: StringValue;
  private readonly JWT_TOKEN_REFRESH: StringValue;
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_TOKEN_ACCESS =
      configService.getOrThrow<StringValue>('JWT_TOKEN_ACCESS');
    this.JWT_TOKEN_REFRESH =
      configService.getOrThrow<StringValue>('JWT_TOKEN_REFRESH');
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }
  async register(res: Response, dto: RegisterRequest) {
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
    return this.auth(res, user.id);
  }

  async login(res: Response, dto: LoginRequest) {
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

    return this.auth(res, user.id);
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

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessExpires: Date,
    refreshExpires: Date,
  ) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires: refreshExpires,
      sameSite: 'strict',
      secure: false,
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires: accessExpires,
      sameSite: 'strict',
      secure: false,
    });
  }

  private auth(res: Response, id: number) {
    const { accessToken, refreshToken } = this.generateTokens(+id);
    this.setCookies(
      res,
      accessToken,
      refreshToken,
      new Date(Date.now() + 2 * 60 * 60),
      new Date(Date.now() + 7 * 24 * 60 * 60),
    );
    return { message: 'Authenticated successfully' };
  }
}
