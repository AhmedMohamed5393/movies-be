import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from '../movie.controller';
import { MovieService } from '../movie.service';
import { AddRatingToMovieDto, AddToWatchListDto, MovieFilterOptionsDto } from '../dtos/index.dto';
import { SuccessClass } from '@shared/classes/success.class';
import { JWTAuthService } from '@shared/services/index.service';
import { AuthGuard } from '@shared/guards/index.guard';

const mockUserId = 'user123';

describe('MovieController', () => {
  let controller: MovieController;
  let mockMovieService: Partial<Record<keyof MovieService, jest.Mock>>;
  let mockJWTAuthService: Partial<JWTAuthService>; // Mocking the JWTAuthService

  beforeEach(async () => {
    mockMovieService = {
      getMovies: jest.fn(),
      getMovieById: jest.fn(),
      addMovieItemToWatchList: jest.fn(),
      addRatingToMovie: jest.fn(),
    };

    mockJWTAuthService = {
      // Mock the methods of JWTAuthService you need for the test, e.g.
      verifyToken: jest.fn().mockResolvedValue(true), // Example method
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: JWTAuthService, useValue: mockJWTAuthService }, // Provide the mock JWTAuthService
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) }, // Mocking AuthGuard if needed
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
  });

  it('should get all movies', async () => {
    const dto = { page: 1, take: 10 } as MovieFilterOptionsDto;
    const mockResult = { movies: ['movie1'], meta: {} };
    mockMovieService.getMovies.mockResolvedValue(mockResult);

    const result = await controller.getMovies(dto);
    expect(result).toMatchObject(new SuccessClass(mockResult));
  });

  it('should get movie by id', async () => {
    const mockMovie = { id: '123', title: 'Test Movie' };
    mockMovieService.getMovieById.mockResolvedValue(mockMovie);

    const result = await controller.getMovieById('123');
    expect(result).toMatchObject(new SuccessClass(mockMovie));
  });

  it('should add movie to watchlist', async () => {
    const dto: AddToWatchListDto = { movie_id: '123' };
    const mockWatchlist = { id: 'watch1' };
    mockMovieService.addMovieItemToWatchList.mockResolvedValue(mockWatchlist);

    const result = await controller.addMovieToWatchList(dto, mockUserId);
    expect(result).toMatchObject(
      new SuccessClass(mockWatchlist, "movie is added to user's watchlist successfully"),
    );
  });

  it('should rate a movie', async () => {
    const dto: AddRatingToMovieDto = { movie_id: '123', rating: 5 };
    const mockRating = { id: 'rate1' };
    mockMovieService.addRatingToMovie.mockResolvedValue(mockRating);

    const result = await controller.addRatingToMovie(dto, mockUserId);
    expect(result).toMatchObject(
      new SuccessClass(mockRating, 'movie is rated by user successfully'),
    );
  });
});
