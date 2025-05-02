import { Test, TestingModule } from '@nestjs/testing';
import { WatchListService } from '../watchlist.service';
import { WatchListRepository } from '../repositories/watchlist.repository';
import { NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { WatchListItem } from '../entities/wishlist.entity';
import { LoggingService } from 'src/modules/logging/logging.service';

describe('WatchListService', () => {
  let service: WatchListService;
  let repo: jest.Mocked<WatchListRepository>;
  let logger: jest.Mocked<LoggingService>;

  const mockWatchListRepo = {
    save: jest.fn(),
    findAndCount: jest.fn(),
    isExist: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockLogger = {
    createLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchListService,
        { provide: WatchListRepository, useValue: mockWatchListRepo },
        { provide: LoggingService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<WatchListService>(WatchListService);
    repo = module.get(WatchListRepository);
    logger = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    movie_id: 'movie1',
    user_id: 'user1',
  };

  it('should add new watchlist item', async () => {
    const mockItem = { id: 'item1', ...payload } as unknown as WatchListItem;
    repo.save.mockResolvedValue(mockItem);

    const result = await service.saveNewWatchListItem(payload);

    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
      movie: { id: payload.movie_id },
      user: { id: payload.user_id },
    }));

    expect(logger.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Added new watchlist item',
        action: expect.stringContaining(payload.movie_id),
        user_id: payload.user_id,
        entity: 'WatchListItem',
      }),
    );

    expect(result).toEqual(mockItem);
  });

  it('should get watchlist items without search', async () => {
    const pageOptions = {
      page: 1,
      take: 10,
      search: undefined,
      order: 'ASC',
    } as PageOptionsDto;
    const items = [{ id: 'item1', movie: { id: 'm1', title: 'Movie A' } }] as WatchListItem[];
    repo.findAndCount.mockResolvedValue([items, 1]);

    const result = await service.getWatchListItems(pageOptions, 'user1');

    expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
      take: 10,
      skip: 0,
      where: { user: { id: 'user1' } },
    }));

    expect(result.items).toEqual(items);
    expect(result.meta.total).toBe(1);
  });

  it('should get watchlist items with search', async () => {
    const pageOptions = {
      page: 2,
      take: 5,
      search: 'avengers',
      order: 'ASC',
    } as PageOptionsDto;

    repo.findAndCount.mockResolvedValue([[], 0]);

    await service.getWatchListItems(pageOptions, 'user1');

    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
        skip: 5,
        where: expect.arrayContaining([
          expect.objectContaining({ movie: { title: ILike('%avengers%') } }),
          expect.objectContaining({ movie: { overview: ILike('%avengers%') } }),
        ]),
      }),
    );
  });

  it('should remove an item if it exists', async () => {
    repo.isExist.mockResolvedValue(true);
    repo.softDelete.mockResolvedValue(undefined);

    await service.removeItemFromWishList('item1', 'user1');

    expect(repo.isExist).toHaveBeenCalledWith({
      id: 'item1',
      user: { id: 'user1' },
    });

    expect(repo.softDelete).toHaveBeenCalledWith('item1');
    expect(logger.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Remove an item from watchlist',
        action: expect.stringContaining('item1'),
      }),
    );
  });

  it('should throw NotFoundException if item does not exist', async () => {
    repo.isExist.mockResolvedValue(false);

    await expect(service.removeItemFromWishList('item1', 'user1')).rejects.toThrow(
      NotFoundException,
    );

    expect(repo.softDelete).not.toHaveBeenCalled();
  });
});
