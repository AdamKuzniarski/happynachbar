import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../dist/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  async signup(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: this.normalizeEmail(email),
          passwordHash,
          profile: { create: {} },
        },
        select: { id: true, email: true, createdAt: true, updatedAt: true },
      });
      return user;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  private async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwt.signAsync(payload);

    return { access_token };
  }
}
