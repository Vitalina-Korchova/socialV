import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendResetCode(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Social V" <${this.configService.get('EMAIL_USER')}>`,
        to: email,
        subject: 'Password reset code',
        text: `Your reset code: ${code}`,
        html: `<p>Your reset code: <b>${code}</b></p>`,
      });
    } catch (error) {
      console.error('Mail sending error:', error);
      throw new InternalServerErrorException('Email not sent');
    }
  }
}
