import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly config: ConfigService) {}

  async sendVerificationEmail(to: string, link: string) {
    const host = this.config.get<string>('SMTP_HOST') || 'mailpit';
    const port = Number(this.config.get<string>('SMTP_PORT') || 1025);
    const from =
      this.config.get<string>('MAIL_FROM') || 'noreply@happynachbar.local';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      tls: { rejectUnauthorized: false }, //nur dev
    });

    const subject = 'Bitte bestätige deine E-Mail-Adresse';

    await transporter.sendMail({
      from,
      to,
      subject,
      text: `Bitte bestätige deine E-Mail:\n${link}`,
      html: `<p>Bitte bestätige deine E-Mail:</p><p><a href="${link}">E-Mail bestätigen</a></p>`,
    });

    this.logger.log(`Verification email sent to ${to}`);
  }
}
