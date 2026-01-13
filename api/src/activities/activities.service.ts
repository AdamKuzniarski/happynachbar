import { Injectable } from '@nestjs/common';
import {
  ActivityCategory as PrismaActivityCategory,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListActivitiesQueryDto } from './dto/list-activities.query.dto';
import { ListActivitiesResponseDto } from './dto/list-activities.response.dto';
import { ActivityCardDto } from './dto/activity-card.dto';
import { ActivityCategory as ApiActivityCategory } from './dto/activity-category.enum';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async list(q: ListActivitiesQueryDto): Promise<ListActivitiesResponseDto> {
    const take = clamp(q.take ?? 20, 1, 50);

    const where: Prisma.ActivityWhereInput = { status: 'ACTIVE' };

    if (q.plz) where.plz = q.plz;
    if (q.category)
      where.category = q.category as unknown as PrismaActivityCategory;
    if (q.createdById) where.createdById = q.createdById;

    if (q.q?.trim()) {
      const term = q.q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    // optional: Zeitraumfilter
    if (q.startFrom || q.startTo) {
      const createdRange: Prisma.DateTimeFilter = {};
      const scheduledRange: Prisma.DateTimeNullableFilter = {};

      if (q.startFrom) {
        const date = new Date(q.startFrom);
        createdRange.gte = date;
        scheduledRange.gte = date;
      }

      if (q.startTo) {
        const date = new Date(q.startTo);
        createdRange.lte = date;
        scheduledRange.lte = date;
      }

      const existingAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
          ? [where.AND]
          : [];

      where.AND = [
        ...existingAnd,
        {
          OR: [
            { scheduledAt: scheduledRange },
            { scheduledAt: null, createdAt: createdRange },
          ],
        },
      ];
    }

    const rows = await this.prisma.activity.findMany({
      where,
      take: take + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        createdBy: {
          select: {
            id: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    const hasMore = rows.length > take;
    const page = rows.slice(0, take);
    const nextCursor = hasMore && page.length ? page[page.length - 1].id : null;

    const items: ActivityCardDto[] = page.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category as unknown as ApiActivityCategory,
      startAt: a.scheduledAt ?? a.createdAt,
      locationLabel: undefined, // optional in DTO
      plz: a.plz,
      createdBy: {
        id: a.createdBy.id,
        displayName: a.createdBy.profile?.displayName ?? 'Neighbor',
      },
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      thumbnailUrl: a.images[0]?.url ?? null,
    }));

    return { items, nextCursor };
  }
}
