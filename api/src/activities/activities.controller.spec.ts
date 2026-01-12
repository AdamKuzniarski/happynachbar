import { Test } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';

describe('ActivitiesController', () => {
  it('delegates to ActivitiesService.list()', async () => {
    const listMock = jest.fn().mockReturnValue({ items: [], nextCursor: null });

    // test comment
    const moduleRef = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [{ provide: ActivitiesService, useValue: { list: listMock } }],
    }).compile();

    const controller = moduleRef.get(ActivitiesController);

    const q = { plz: '10115', take: 20 };
    const res = controller.List(q as any);

    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledWith(q);
    expect(res).toEqual({ items: [], nextCursor: null });
  });
});
