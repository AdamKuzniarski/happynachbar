import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

const conversationInclude = {
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
    select: {
      body: true,
      createdAt: true,
      senderId: true,
      deletedAt: true,
    },
  },
  reads: {
    take: 1,
    select: { lastReadAt: true },
  },
  activity: {
    select: { title: true },
  },
} as const;

type ConversationRow = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

type MessageWithMeta = Prisma.MessageGetPayload<{
  select: {
    id: true;
    conversationId: true;
    senderId: true;
    body: true;
    createdAt: true;
    editedAt: true;
    deletedAt: true;
  };
}>;

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private toMessageDto(message: {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: Date;
    editedAt?: Date | null;
    deletedAt?: Date | null;
  }): MessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.deletedAt ? null : message.body,
      createdAt: message.createdAt.toISOString(),
      editedAt: message.editedAt ? message.editedAt.toISOString() : null,
      deletedAt: message.deletedAt ? message.deletedAt.toISOString() : null,
    };
  }

  private async touchRead(userId: string, conversationId: string) {
    await this.prisma.conversationRead.upsert({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      update: { lastReadAt: new Date() },
      create: { conversationId, userId, lastReadAt: new Date() },
    });
  }

  private async listConversationRows(
    userId: string,
  ): Promise<ConversationRow[]> {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        ...conversationInclude,
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

  async createOrGetByUser(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestException('Cannot start a chat with yourself');
    }

    const other = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true },
    });
    if (!other) throw new NotFoundException('User not found');

    const [participantAId, participantBId] = sortPair(userId, otherUserId);

    const existing = await this.prisma.conversation.findFirst({
      where: {
        participantAId,
        participantBId,
        activityId: null,
      },
      select: { id: true },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        participantAId,
        participantBId,
        activityId: null,
      },
      select: { id: true },
    });
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
      body: m.deletedAt ? null : m.body,
      createdAt: m.createdAt.toISOString(),
      editedAt: m.editedAt ? m.editedAt.toISOString() : null,
      deletedAt: m.deletedAt ? m.deletedAt.toISOString() : null,
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

    return this.toMessageDto(message);
  }

  async listConversations(
    userId: string,
  ): Promise<ListConversationsResponseDto> {
    const conversations = await this.listConversationRows(userId);

    const items = conversations.map((c) => {
      const other =
        c.participantAId === userId ? c.participantB : c.participantA;
      const last = c.messages[0];
      const lastReadAt = c.reads[0]?.lastReadAt;
      const hasUnread =
        !!last &&
        last.senderId !== userId &&
        (!lastReadAt || last.createdAt > lastReadAt);
      return {
        id: c.id,
        participantId: other.id,
        participantDisplayName: other.profile?.displayName ?? 'Neighbor',
        participantAvatarUrl: other.profile?.avatarUrl ?? null,
        activityId: c.activityId,
        activityTitle: c.activity?.title ?? null,
        hasUnread,
        lastMessageBody: last
          ? last.deletedAt
            ? 'Nachricht gelöscht'
            : last.body
          : null,
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

  async editMessage(
    userId: string,
    messageId: string,
    body: string,
  ): Promise<MessageDto> {
    const message: MessageWithMeta | null =
      await this.prisma.message.findUnique({
        where: { id: messageId },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          body: true,
          createdAt: true,
          editedAt: true,
          deletedAt: true,
        },
      });

    if (!message) throw new NotFoundException('Message not found');
    await this.assertConversationAccess(userId, message.conversationId);
    if (message.senderId !== userId) {
      throw new ForbiddenException('Cannot edit this message');
    }
    if (message.deletedAt) {
      throw new BadRequestException('Message already deleted');
    }

    const nextBody = body.trim();
    if (!nextBody) throw new BadRequestException('Message cannot be empty');

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { body: nextBody, editedAt: new Date() },
    });

    return this.toMessageDto(updated);
  }

  async deleteMessage(userId: string, messageId: string): Promise<MessageDto> {
    const message: MessageWithMeta | null =
      await this.prisma.message.findUnique({
        where: { id: messageId },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          body: true,
          createdAt: true,
          editedAt: true,
          deletedAt: true,
        },
      });

    if (!message) throw new NotFoundException('Message not found');
    await this.assertConversationAccess(userId, message.conversationId);
    if (message.senderId !== userId) {
      throw new ForbiddenException('Cannot delete this message');
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: message.deletedAt ?? new Date() },
    });

    return this.toMessageDto(updated);
  }
}
