import { Test, TestingModule } from '@nestjs/testing';
import { TmdbCronService } from '../tmdb-cron.service';
import { TmdbService } from '../tmdb.service';

describe('TmdbCronService', () => {
  let cronService: TmdbCronService;
  let tmdbService: TmdbService;

  const mockTmdbService = {
    syncGenres: jest.fn(),
    syncPopularMovies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbCronService,
        { provide: TmdbService, useValue: mockTmdbService },
      ],
    }).compile();

    cronService = module.get<TmdbCronService>(TmdbCronService);
    tmdbService = module.get<TmdbService>(TmdbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cronService).toBeDefined();
  });

  describe('handleDailySync', () => {
    it('should call syncGenres and syncPopularMovies', async () => {
      await cronService.handleDailySync();

      expect(tmdbService.syncGenres).toHaveBeenCalledTimes(1);
      expect(tmdbService.syncPopularMovies).toHaveBeenCalledTimes(1);
    });
  });
});
