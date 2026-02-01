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
import { ListConversationsResponseDto } from './dto/chat-conversations.dto';
import { UnreadCountDto } from './dto/chat-unread.dto';

function sortPair(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async touchRead(userId: string, conversationId: string) {
    await this.prisma.conversationRead.upsert({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      update: { lastReadAt: new Date() },
      create: { conversationId, userId, lastReadAt: new Date() },
    });
  }

  private async listConversationRows(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participantA: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        participantB: {
          select: {
            id: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { body: true, createdAt: true, senderId: true },
        },
        reads: {
          where: { userId },
          take: 1,
          select: { lastReadAt: true },
        },
      },
    });
  }

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

    await this.touchRead(userId, conversationId);

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

  async listConversations(
    userId: string,
  ): Promise<ListConversationsResponseDto> {
    const conversations = await this.listConversationRows(userId);

    const items = conversations.map((c) => {
      const other =
        c.participantAId === userId ? c.participantB : c.participantA;
      const last = c.messages[0];
      return {
        id: c.id,
        participantId: other.id,
        participantDisplayName: other.profile?.displayName ?? 'Neighbor',
        participantAvatarUrl: other.profile?.avatarUrl ?? null,
        activityId: c.activityId,
        lastMessageBody: last?.body ?? null,
        lastMessageAt: last?.createdAt ? last.createdAt.toISOString() : null,
      };
    });

    return { items };
  }

  async markRead(userId: string, conversationId: string) {
    await this.assertConversationAccess(userId, conversationId);
    await this.touchRead(userId, conversationId);
    return { ok: true };
  }

  async getUnreadCount(userId: string): Promise<UnreadCountDto> {
    const conversations = await this.listConversationRows(userId);

    const count = conversations.filter((c) => {
      const last = c.messages[0];
      if (!last) return false;
      if (last.senderId === userId) return false;
      const lastReadAt = c.reads[0]?.lastReadAt;
      if (!lastReadAt) return true;
      return last.createdAt > lastReadAt;
    }).length;

    return { count };
  }

  async deleteConversation(userId: string, conversationId: string) {
    await this.assertConversationAccess(userId, conversationId);
    await this.prisma.conversation.delete({ where: { id: conversationId } });
    return { ok: true };
  }
}
