import { Catch, WsExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<any>();
    const errorMessage = exception?.message || 'Unknown error';

    client.emit('error', { message: errorMessage });
  }
}
