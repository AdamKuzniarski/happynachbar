import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateMe(userId: string, dto: UpdateMeDto) {
    const data: Prisma.UserProfileUpdateInput = {};

    if (dto.plz != null) data.plz = dto.plz;
    if (dto.displayName != null) data.displayName = dto.displayName;
    if (dto.avatarUrl != null) data.avatarUrl = dto.avatarUrl;
    if (dto.bio != null) data.bio = dto.bio;

    if (Object.keys(data).length === 0) {
      return { ok: true };
    }

    await this.prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    return { ok: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            displayName: true,
            plz: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const profile = user.profile ?? null;

    const missing: string[] = [];

    const dn = profile?.displayName?.trim();
    if (!dn || dn === 'Neighbor') missing.push('displayName');

    if (!profile?.plz?.trim()) missing.push('plz');
    if (!profile?.avatarUrl?.trim()) missing.push('avatarUrl');
    if (!profile?.bio?.trim()) missing.push('bio');

    const total = 4;
    const done = total - missing.length;
    const percent = Math.round((done / total) * 100);

    return {
      id: user.id,
      email: user.email,
      profile,
      profileCompletion: {
        isComplete: missing.length === 0,
        percent,
        missing,
      },
    };
  }
}
