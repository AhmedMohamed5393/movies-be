import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from '../rating.service';
import { RatingRepository } from '../repositories/rating.repository';
import { ConflictException } from '@nestjs/common';
import { Rating } from '../entities/rating.entity';
import { LoggingService } from 'src/modules/logging/logging.service';

describe('RatingService', () => {
  let service: RatingService;
  let ratingRepo: jest.Mocked<RatingRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockRatingRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockLoggingService = {
    createLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: RatingRepository, useValue: mockRatingRepo },
        { provide: LoggingService, useValue: mockLoggingService },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    ratingRepo = module.get(RatingRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    movie_id: 'movie-1',
    user_id: 'user-1',
    value: 4,
  };

  it('should add a new rating if not exists', async () => {
    ratingRepo.findOne.mockResolvedValue(null);
    ratingRepo.save.mockResolvedValue({ ...payload, id: 'rating-1' } as unknown as Rating);

    const result = await service.addRating(payload);

    expect(ratingRepo.findOne).toHaveBeenCalledWith({
      where: {
        user: { id: payload.user_id },
        movie: { id: payload.movie_id },
      },
    });

    expect(ratingRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      movie: { id: payload.movie_id },
      user: { id: payload.user_id },
      value: payload.value,
    }));

    expect(loggingService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Added a movie rating',
        action: expect.stringContaining(payload.movie_id),
        entity: 'Rating',
        user_id: payload.user_id,
      }),
    );

    expect(result).toEqual({ ...payload, id: 'rating-1' });
  });

  it('should update rating if different value exists', async () => {
    const existingRating = {
      id: 'rating-1',
      value: 2,
      movie: { id: payload.movie_id } as any,
      user: { id: payload.user_id } as any,
    } as Rating;

    ratingRepo.findOne.mockResolvedValue(existingRating);
    ratingRepo.update.mockResolvedValue(undefined);

    const result = await service.addRating(payload);

    expect(ratingRepo.update).toHaveBeenCalledWith({
      where: { id: existingRating.id },
      data: { value: payload.value },
    });

    expect(loggingService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Edited a movie rating',
        action: expect.stringContaining(payload.movie_id),
        entity: 'Rating',
        user_id: payload.user_id,
      }),
    );

    expect(result).toEqual({
      ...existingRating,
      value: payload.value,
    });
  });

  it('should throw conflict if same rating value exists', async () => {
    ratingRepo.findOne.mockResolvedValue({
      id: 'rating-1',
      value: payload.value,
      movie: { id: payload.movie_id },
      user: { id: payload.user_id },
    } as Rating);

    await expect(service.addRating(payload)).rejects.toThrow(ConflictException);

    expect(ratingRepo.update).not.toHaveBeenCalled();
    expect(loggingService.createLog).not.toHaveBeenCalled();
  });
});
