import { ActivitiesService } from './activities.service';
import { ActivityCategory } from './dto/activity-category.enum';

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(() => {
    service = new ActivitiesService();
  });

  it('returns stable shape { items, nextCursor }', () => {
    const res = service.list({});
    expect(Array.isArray(res.items)).toBe(true);
    expect(res).toHaveProperty('nextCursor');
  });

  it('sorts newest first by createdAt', () => {
    const res = service.list({});
    expect(res.items.length).toBeGreaterThan(0);

    for (let i = 1; i < res.items.length; i++) {
      expect(res.items[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
        res.items[i].createdAt.getTime(),
      );
    }
  });

  it('filters by plz', () => {
    const res = service.list({ plz: '10115' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((x) => x.plz === '10115')).toBe(true);
  });

  it('filters by category', () => {
    const res = service.list({ category: ActivityCategory.SOCIAL });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((x) => x.category === ActivityCategory.SOCIAL)).toBe(
      true,
    );
  });

  it('filters by q (title/locationLabel)', () => {
    const res = service.list({ q: 'kaffee' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(
      res.items.every(
        (x) =>
          (x.title ?? '').toLowerCase().includes('kaffee') ||
          (x.locationLabel ?? '').toLowerCase().includes('kaffee'),
      ),
    ).toBe(true);
  });

  it('paginates with cursor', () => {
    const page1 = service.list({ take: 1 });
    expect(page1.items.length).toBe(1);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = service.list({ take: 1, cursor: page1.nextCursor! });
    // bei 2 fixtures: page2 hat 1 item, dann Ende
    expect(page2.items.length).toBe(1);
    expect(page2.items[0].id).not.toBe(page1.items[0].id);
  });

  it('clamps take (min 1, max 50)', () => {
    const minRes = service.list({ take: 0 as any });
    expect(minRes.items.length).toBe(1);

    const maxRes = service.list({ take: 999 as any });
    expect(maxRes.items.length).toBeLessThanOrEqual(50);
  });
});
