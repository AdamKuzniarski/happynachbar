import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ActivityCategory as PrismaActivityCategory,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateActivityDto,
  UpdateActivityDto,
  ListActivitiesQueryDto,
} from './dto/activities.input.dto';
import { ListActivitiesResponseDto } from './dto/list-activities.response.dto';
import { ActivityCardDto, ActivityDetailDto } from './dto/activity.dto';
import { ActivityCategory as ApiActivityCategory } from './dto/activity-category.enum';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  //Public route GET /activities
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

    //  Zeitraumfilter
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
      category: a.category as ApiActivityCategory,
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

  // Detail public route GET /activities/:id

  async getById(id: string): Promise<ActivityDetailDto> {
    const a = await this.prisma.activity.findFirst({
      where: { id, status: 'ACTIVE' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        createdBy: {
          select: { id: true, profile: { select: { displayName: true } } },
        },
      },
    });

    if (!a) throw new NotFoundException('Activity not found');

    return {
      id: a.id,
      title: a.title,
      description: a.description ?? undefined,
      category: a.category as ApiActivityCategory,
      startAt: a.scheduledAt ?? a.createdAt,
      plz: a.plz,
      locationLabel: undefined,
      thumbnailUrl: a.images[0]?.url ?? null,
      createdBy: {
        id: a.createdBy.id,
        displayName: a.createdBy.profile?.displayName ?? 'Neighbor',
      },
      images: a.images.map((img) => ({
        url: img.url,
        sortOrder: img.sortOrder,
        alt: img.alt ?? undefined,
      })),
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  // Create (auth)

  async create(
    userId: string,
    dto: CreateActivityDto,
  ): Promise<ActivityDetailDto> {
    const a = await this.prisma.activity.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category as PrismaActivityCategory,
        status: 'ACTIVE',
        plz: dto.plz,
        scheduledAt: dto.startAt ? new Date(dto.startAt) : null,
        createdById: userId,
        images: dto.imageUrls?.length
          ? {
              create: dto.imageUrls.map((url, idx) => ({
                url,
                sortOrder: idx,
                alt: dto.title,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        createdBy: {
          select: { id: true, profile: { select: { displayName: true } } },
        },
      },
    });

    return this.getById(a.id);
  }

  // Update (auth + owner)
  async update(
    userId: string,
    id: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityDetailDto> {
    const existing = await this.prisma.activity.findUnique({
      where: { id },
      select: { id: true, createdById: true, status: true },
    });

    if (!existing || existing.status !== 'ACTIVE')
      throw new NotFoundException('Activity not found');
    if (existing.createdById !== userId)
      throw new ForbiddenException('Not owner');

    if (dto.imageUrls) {
      await this.prisma.activityImage.deleteMany({ where: { activityId: id } });
      if (dto.imageUrls.length) {
        await this.prisma.activityImage.createMany({
          data: dto.imageUrls.map((url, idx) => ({
            activityId: id,
            url,
            sortOrder: idx,
            alt: dto.title ?? 'Activity image',
          })),
        });
      }
    }

    await this.prisma.activity.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category as PrismaActivityCategory,
        plz: dto.plz,
        scheduledAt: dto.startAt ? new Date(dto.startAt) : undefined,
      },
    });

    return this.getById(id);
  }

  // Delete(auth + owner) -> soft delete -die Dateien werden Archiviert- nicht mehr auf der seite zu sehen, aber in DB existent
  async archive(userId: string, id: string): Promise<{ ok: true }> {
    const existing = await this.prisma.activity.findUnique({
      where: { id },
      select: { id: true, createdById: true, status: true },
    });

    if (!existing || existing.status !== 'ACTIVE')
      throw new NotFoundException('Activity not found');
    if (existing.createdById !== userId)
      throw new ForbiddenException('Not owner');

    await this.prisma.activity.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return { ok: true };
  }
}
