import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('moderator')
@ApiBearerAuth('brarer')
@Controller('moderator')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModeratorConroller {
  @Get('ping')
  @Roles(UserRole.MODERATOR)
  ping() {
    return { ok: true, role: UserRole.MODERATOR };
  }
}
