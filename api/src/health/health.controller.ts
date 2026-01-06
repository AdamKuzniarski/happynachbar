import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  getHealth() {
    return { status: 'ok' };
  }

  @Get('db')
  async getDbHealth() {
    //Connectivity check
    await this.prisma.$queryRaw`SELECT 1`;

    //Einfache Queries um sicherzustellen, dass die DB Tabellen erreichbar sind
    const usersCount = await this.prisma.user.count();

    return { status: 'db ok', usersCount };
  }
}
