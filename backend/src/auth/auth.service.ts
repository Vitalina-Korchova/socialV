import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { LoginRequest } from './dto/login.dto';
import type { Request, Response } from 'express';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly JWT_TOKEN_ACCESS: StringValue;
  private readonly JWT_TOKEN_REFRESH: StringValue;
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

    const freeAvatars = await this.prismaService.shop_item.findMany({
      where: {
        type: 'AVATAR',
        is_free: true,
      },
      take: 2,
      orderBy: {
        id: 'asc',
      },
    });

    const freeBackground = await this.prismaService.shop_item.findFirst({
      where: {
        type: 'BACKGROUND',
        is_free: true,
      },
    });

    const userShopItems: {
      user_id: number;
      shop_item_id: number;
      is_active: boolean;
    }[] = [];

    freeAvatars.forEach((avatar, index) => {
      userShopItems.push({
        user_id: user.id,
        shop_item_id: avatar.id,
        is_active: index === 0, // Only the first avatar is active
      });
    });

    if (freeBackground) {
      userShopItems.push({
        user_id: user.id,
        shop_item_id: freeBackground.id,
        is_active: true,
      });
    }

    if (userShopItems.length > 0) {
      await this.prismaService.user_shop_item.createMany({
        data: userShopItems,
      });
    }
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

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      try {
        const decoded = this.jwtService.decode(refreshToken) as {
          id: number;
          jti?: string;
          exp?: number;
        };

        if (decoded) {
          const tokenId = decoded.jti || refreshToken;

          await this.prismaService.used_refresh_token.create({
            data: {
              token_id: tokenId,
              user_id: decoded.id,
              expires_at: decoded.exp
                ? new Date(decoded.exp * 1000)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }
      } catch (error) {
        console.warn('Error during logout token processing:', error.message);
      }
    }

    this.setCookies(res, '', '', new Date(0), new Date(0));

    return { message: 'Logged out successfully' };
  }

  async refresh(req: Request, res: Response) {
    const oldRefreshToken = req.cookies['refreshToken'];

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const decoded = this.jwtService.decode(oldRefreshToken) as {
        id: number;
        jti?: string;
        exp?: number;
      };

      if (!decoded) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokenId = decoded.jti || oldRefreshToken;

      const usedToken = await this.prismaService.used_refresh_token.findUnique({
        where: { token_id: tokenId },
      });

      if (usedToken) {
        throw new UnauthorizedException('Refresh token already used');
      }

      const payload = await this.jwtService.verifyAsync<{
        id: number;
        jti?: string;
      }>(oldRefreshToken);

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
        select: { id: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.prismaService.used_refresh_token.create({
        data: {
          token_id: tokenId,
          user_id: user.id,
          expires_at: decoded.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return this.auth(res, user.id);
    } catch (error) {
      console.error('Refresh error details:', error);

      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  async validate(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async sendCodeToEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prismaService.user_reset_password.create({
      data: {
        user_id: user.id,
        code_hash: await hash(code),
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        used: false,
      },
    });

    await this.mailService.sendResetCode(email, code);
    return { message: 'Reset code sent' };
  }

  async verifyCode(email: string, code: string) {
    const resetEntry = await this.prismaService.user_reset_password.findFirst({
      where: {
        user: {
          email,
        },
        used: false,
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!resetEntry) {
      throw new NotFoundException('Valid reset code not found or expired');
    }

    const isCodeValid = await verify(resetEntry.code_hash, code);
    if (!isCodeValid) {
      throw new BadRequestException('Reset code is invalid');
    }

    return { message: 'Code verified successfully' };
  }

  async resetPassword(email: string, code: string, password: string) {
    const resetEntry = await this.prismaService.user_reset_password.findFirst({
      where: {
        user: {
          email,
        },
        used: false,
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!resetEntry) {
      throw new NotFoundException('Valid reset code not found or expired');
    }

    const isCodeValid = await verify(resetEntry.code_hash, code);
    if (!isCodeValid) {
      throw new BadRequestException('Reset code is invalid');
    }

    await this.prismaService.user_reset_password.update({
      where: {
        id: resetEntry.id,
      },
      data: { used: true },
    });

    await this.prismaService.user.update({
      where: {
        id: resetEntry.user_id,
      },
      data: {
        password: await hash(password),
      },
    });

    return { message: 'Password reset successfully' };
  }
  private generateTokens(id: number) {
    const jti = Math.random().toString(36).substring(2) + Date.now();
    const payload: { id: number; jti: string } = { id, jti };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_TOKEN_ACCESS,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_TOKEN_REFRESH,
    });

    return { accessToken, refreshToken, jti };
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
      new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7days,
    );
    return { message: 'Authenticated successfully' };
  }
}
