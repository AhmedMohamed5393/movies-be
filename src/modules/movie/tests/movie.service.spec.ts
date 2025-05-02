import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@shared/services/redis.service';
import { NotFoundException } from '@nestjs/common';
import { MovieService } from '../movie.service';
import { MovieRepository } from '../repositories/movie.repository';
import { WatchListService } from 'src/modules/watchlist/watchlist.service';
import { RatingService } from 'src/modules/rating/rating.service';
import { AddRatingToMovieDto, AddToWatchListDto, MovieFilterOptionsDto } from '../dtos/index.dto';
import { Genre } from 'src/modules/genre/entities/genre.entity';

const mockUserId = 'user123';

describe('MovieService', () => {
  let service: MovieService;
  let mockMovieRepository: any;
  let mockWatchListService: any;
  let mockRatingService: any;
  let mockRedisService: any;

  beforeEach(async () => {
    mockMovieRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      isExist: jest.fn(),
    };
    mockWatchListService = {
      saveNewWatchListItem: jest.fn(),
    };
    mockRatingService = {
      addRating: jest.fn(),
    };
    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: MovieRepository, useValue: mockMovieRepository },
        { provide: WatchListService, useValue: mockWatchListService },
        { provide: RatingService, useValue: mockRatingService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  describe('addMovieItemToWatchList', () => {
    it('should add a movie to watch list', async () => {
      const dto: AddToWatchListDto = { movie_id: 'movie123' };
      mockWatchListService.saveNewWatchListItem.mockResolvedValue('watchlistItem');

      const result = await service.addMovieItemToWatchList(dto, mockUserId);

      expect(mockWatchListService.saveNewWatchListItem).toHaveBeenCalledWith({
        user_id: mockUserId,
        movie_id: dto.movie_id,
      });
      expect(result).toBe('watchlistItem');
    });
  });

  describe('addRatingToMovie', () => {
    it('should add a rating to a movie', async () => {
      const dto: AddRatingToMovieDto = { rating: 4, movie_id: 'movie123' };
      mockRatingService.addRating.mockResolvedValue('ratingResult');

      const result = await service.addRatingToMovie(dto, mockUserId);

      expect(mockRatingService.addRating).toHaveBeenCalledWith({
        user_id: mockUserId,
        movie_id: dto.movie_id,
        value: dto.rating,
      });
      expect(result).toBe('ratingResult');
    });
  });

  describe('getMovies', () => {
    it('should return movies from cache if available', async () => {
      const dto = { page: 1, take: 10 } as MovieFilterOptionsDto;
      const cachedData = { movies: ['cached movie'], meta: {} };
      mockRedisService.get.mockResolvedValue(cachedData);

      const result = await service.getMovies(dto);

      expect(mockRedisService.get).toHaveBeenCalled();
      expect(result).toBe(cachedData);
    });

    it('should fetch from DB and cache the result if not cached', async () => {
      const dto = { page: 1, take: 10 } as MovieFilterOptionsDto;
      mockRedisService.get.mockResolvedValue(null);
      mockMovieRepository.findAndCount.mockResolvedValue([['movie'], 1]);
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await service.getMovies(dto);

      expect(mockMovieRepository.findAndCount).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalled();
      expect(result.movies).toEqual(['movie']);
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by id', async () => {
      const movie = { id: 'movie123' };
      mockMovieRepository.findOne.mockResolvedValue(movie);

      const result = await service.getMovieById('movie123');

      expect(result).toBe(movie);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.getMovieById('movie123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveNewMovie', () => {
    it('should save a new movie', async () => {
      const dto = {
        title: 'Movie',
        overview: 'Overview',
        poster_path: 'path',
        release_date: '2025-01-01',
        genres: [{ id: 'genre1', name: 'Action' }] as Genre[],
      };
      const expected = { ...dto, id: 'movie1' };
      mockMovieRepository.save.mockResolvedValue(expected);

      const result = await service.saveNewMovie(dto);

      expect(mockMovieRepository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(result).toBe(expected);
    });
  });

  describe('checkExistenceById', () => {
    it('should return true if movie exists', async () => {
      mockMovieRepository.isExist.mockResolvedValue(true);

      const result = await service.checkExistenceById('movie123');

      expect(result).toBe(true);
    });
  });
});
