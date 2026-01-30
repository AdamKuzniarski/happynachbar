import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function sortPair(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createOrGetByActivity(userId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, status: 'ACTIVE' },
      select: { createdById: true },
    });

    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.createdById === userId) {
      throw new BadRequestException('Cannot start a chat with yourself');
    }

    const [participantAId, participantBId] = sortPair(
      userId,
      activity.createdById,
    );

    const conversation = await this.prisma.conversation.upsert({
      where: {
        participantAId_participantBId_activityId: {
          participantAId,
          participantBId,
          activityId,
        },
      },
      update: {},
      create: {
        participantAId,
        participantBId,
        activityId,
      },
    });

    return conversation;
  }
}
