import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

type VerifyEmailPayload = {
  sub: string;
  purpose: 'verify-email';
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  private getEmailTokenSecret() {
    return (
      this.config.get<string>('EMAIL_TOKEN_SECRET') ??
      this.config.getOrThrow<string>('JWT_SECRET')
    );
  }

  private getEmailTokenExpiresIn() {
    return this.config.get<string>('EMAIL_TOKEN_EXPIRES_IN') ?? '24h';
  }

  private async signEmailVerificationToken(userId: string) {
    const payload: VerifyEmailPayload = {
      sub: userId,
      purpose: 'verify-email',
    };

    return this.jwt.signAsync(payload, {
      secret: this.getEmailTokenSecret(),
      expiresIn: this.getEmailTokenExpiresIn(),
    });
  }

  async signup(email: string, password: string, displayName?: string) {
    const passwordHash = await bcrypt.hash(password, 12);
    const dn = displayName?.trim() ? displayName.trim() : undefined;

    try {
      const user = await this.prisma.user.create({
        data: {
          email: this.normalizeEmail(email),
          passwordHash,
          emailVerifiedAt: null, // ✅ wichtig: unverified
          profile: { create: dn ? { displayName: dn } : {} },
        },
        select: { id: true, email: true, createdAt: true, updatedAt: true },
      });

      const token = await this.signEmailVerificationToken(user.id);

      const webUrl =
        this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';
      const verifyLink = `${webUrl}/auth/verify?token=${encodeURIComponent(token)}`;

      try {
        await this.mail.sendVerificationEmail(user.email, verifyLink);
      } catch (e) {
        await this.prisma.user.delete({ where: { id: user.id } });
        throw new InternalServerErrorException(
          'Could not send verification email',
        );
      }

      return user;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async verifyEmail(token: string) {
    let payload: VerifyEmailPayload;

    try {
      payload = await this.jwt.verifyAsync<VerifyEmailPayload>(token, {
        secret: this.getEmailTokenSecret(),
      });
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }

    if (!payload?.sub || payload.purpose !== 'verify-email') {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, emailVerifiedAt: true },
    });

    if (!user) throw new BadRequestException('Invalid token');

    if (user.emailVerifiedAt) {
      return { verified: true };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });

    return { verified: true };
  }

  private async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isBanned: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isBanned) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Email not verified');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwt.signAsync(payload);

    return { access_token };
  }
}
