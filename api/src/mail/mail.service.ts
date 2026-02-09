import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter;

  constructor(private readonly config: ConfigService) {}

  private env(key: string, fallback?: string) {
    return this.config.get<string>(key) ?? process.env[key] ?? fallback;
  }

  private getTransporter() {
    if (this.transporter) return this.transporter;

    const host = this.env('SMTP_HOST', 'mailpit');
    const port = Number(this.env('SMTP_PORT', '1025'));
    const user = this.env('SMTP_USER'); 
    const pass = this.env('SMTP_PASS');
    const secure = port === 465; 

    this.logger.log(`SMTP host=${host} port=${port} user=${user ?? 'none'}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,

      requireTLS: port === 587,
    });

    return this.transporter;
  }

  async sendVerificationEmail(to: string, link: string) {
    const from = this.env('MAIL_FROM', 'noreply@happynachbar.local');
    const subject = 'Bitte bestätige deine E-Mail-Adresse';

    try {
      const transporter = this.getTransporter();

      await transporter.sendMail({
        from,
        to,
        subject,
        text: `Bitte bestätige deine E-Mail:\n${link}`,
        html: `<p>Bitte bestätige deine E-Mail:</p><p><a href="${link}">E-Mail bestätigen</a></p><p><small>${link}</small></p>`,
      });

      this.logger.log(`Verification email sent to=${to}`);
    } catch (e: any) {
      this.logger.error(
        `sendVerificationEmail failed to=${to}`,
        e?.stack ?? String(e),
      );
      throw e;
    }
  }
}
