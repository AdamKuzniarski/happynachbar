import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChatMessagesQueryDto,
  ListMessagesResponseDto,
  MessageDto,
} from './dto/chat-messages.dto';

function sortPair(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async assertConversationAccess(userId: string, conversationId: string) {
    const convo = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      select: { id: true },
    });

    if (!convo) throw new NotFoundException('Conversation not found');
  }

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

  async listMessages(
    userId: string,
    conversationId: string,
    q: ChatMessagesQueryDto,
  ): Promise<ListMessagesResponseDto> {
    await this.assertConversationAccess(userId, conversationId);

    const take = clamp(q.take ?? 20, 1, 50);

    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      take: take + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = rows.length > take;
    const page = rows.slice(0, take);
    const nextCursor = hasMore && page.length ? page[page.length - 1].id : null;

    const items = page.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    }));

    return { items, nextCursor };
  }

  async createMessage(
    userId: string,
    conversationId: string,
    body: string,
  ): Promise<MessageDto> {
    await this.assertConversationAccess(userId, conversationId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { conversationId, senderId: userId, body },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
