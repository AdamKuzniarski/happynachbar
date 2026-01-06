import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateMe(userId: string, dto: UpdateMeDto) {
    if (dto.plz !== undefined) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        update: { plz: dto.plz },
        create: { userId, plz: dto.plz },
      });
    }

    return { ok: true };
  }
}
