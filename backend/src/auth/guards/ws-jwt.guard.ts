import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();


    let accessToken: string | null = null;
    const authHeader = client.handshake.headers['authorization'];
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      accessToken = authHeader.split(' ')[1];
    }

    if (!accessToken && client.handshake.query.token) {
      accessToken = client.handshake.query.token as string;
    }

    if (!accessToken && client.handshake.headers.cookie) {
      const cookies = client.handshake.headers.cookie
        .split(';')
        .reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      accessToken = cookies['accessToken'];
    }

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      // attach user to socket
      (client as any).user = payload;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
