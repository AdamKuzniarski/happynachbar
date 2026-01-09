import { Injectable } from '@nestjs/common';
import { ActivityCategory } from './dto/activity-category.enum';
import { ActivityCardDto } from './dto/activity-card.dto';
import { ListActivitiesQueryDto } from './dto/list-activities.query.dto';
import { ListActivitiesResponseDto } from './dto/list-activities.response.dto';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function includesText(value: string | undefined, q: string) {
  return (value ?? '').toLowerCase().includes(q.toLocaleLowerCase());
}

@Injectable()
export class ActivitiesService {
  // Dummy Daten, dass irgendwas zum Fetchen wird ohne DB
  private readonly data: ActivityCardDto[] = [
    {
      id: 'act_0001',
      title: 'Spaziergang',
      category: ActivityCategory.OUTDOOR,
      startAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      locationLabel: 'Park',
      plz: '10115',
      createdBy: { id: 'u_01', displayName: 'Anna' },
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 60 * 1000),
      isFavorited: false,
    },
    {
      id: 'act_0002',
      title: 'Kaffee & Quatschen',
      category: ActivityCategory.SOCIAL,
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      locationLabel: 'Prenzlauer Berg',
      plz: '10405',
      createdBy: { id: 'u_02', displayName: 'Ben' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isFavorited: true,
    },
  ];

  list(q: ListActivitiesQueryDto): ListActivitiesResponseDto {
    const take = clamp(q.take ?? 20, 1, 50);

    // sort newest first
    let items = [...this.data].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    // filters
    if (q.plz) items = items.filter((x) => x.plz === q.plz);
    if (q.category) items = items.filter((x) => x.category === q.category);

    if (q.q) {
      items = items.filter(
        (x) =>
          includesText(x.title, q.q!) || includesText(x.locationLabel, q.q!),
      );
    }
    // cursor pagination
    let startIndex = 0;
    if (q.cursor) {
      const idx = items.findIndex((x) => x.id === q.cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    const page = items.slice(startIndex, startIndex + take);
    const hasMore = startIndex + take < items.length;
    const nextCursor = hasMore && page.length ? page[page.length - 1].id : null;

    return { items: page, nextCursor };
  }
}
