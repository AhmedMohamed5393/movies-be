import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from '../movie.controller';
import { MovieService } from '../movie.service';
import { SuccessClass } from '@shared/classes/success.class';
import { AddDto, EditDto } from '../dtos/index.dto';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { AuthGuard } from '@shared/guards/index.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { Movie } from '../entities/movie.entity';

describe('MovieController', () => {
  let movieController: MovieController;
  let movieService: MovieService;

  const mockAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: '550e8400-e29b-41d4-a716-446655440044' }; // Simulate authenticated user
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            saveNewMovie: jest.fn(),
            getMovies: jest.fn(),
            getMovieById: jest.fn(),
            editMovie: jest.fn(),
            deleteMovie: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    movieController = module.get<MovieController>(MovieController);
    movieService = module.get<MovieService>(MovieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(movieController).toBeDefined();
  });

  describe('addMovie', () => {
    it('should create a new movie and return a success response', async () => {
      const addDto: AddDto = {
        title: "New movie title",
        overview: "New Movie overview",
      };

      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };
      const savedMovie = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        ...addDto,
        created_at: new Date(),
      } as Movie;

      jest.spyOn(movieService, 'saveNewMovie').mockResolvedValue(savedMovie);

      const result = await movieController.addMovie(addDto, user);

      expect(movieService.saveNewMovie).toHaveBeenCalledWith(addDto, user);
      expect(result).toEqual(
        new SuccessClass(savedMovie, 'movie is created successfully'),
      );
    });
  });

  describe('getMovies', () => {
    it('should return a paginated list of movies', async () => {
      const pageOptionsDto = {
        page: 1,
        take: 10,
        search: 'Samsung',
      } as PageOptionsDto;

      const movies = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "New movie title",
          overview: "New moview overview",
          poster: {
            id: "550e8400-e29b-41d4-a716-446655440044",
            email: "ahmedmohamedalex93@gmail.com",
          },
          created_at: new Date(),
        },
      ] as Movie[];

      const meta = {
        itemsPerPage: movies.length,
        total: 1,
        pageOptionsDto,
      } as unknown as PageMetaDto;

      jest.spyOn(movieService, 'getMovies').mockResolvedValue({ meta, movies });

      const result = await movieController.getMovies(pageOptionsDto);

      expect(movieService.getMovies).toHaveBeenCalledWith(pageOptionsDto);
      expect(result).toEqual(new SuccessClass({ meta, movies }));
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by ID', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";
      const movie = {
        id: movieId,
        title: "New movie title",
        overview: "New movie overview",
        poster: {
          id: "550e8400-e29b-41d4-a716-446655440044",
          email: "ahmedmohamedalex93@gmail.com",
        },
        created_at: new Date(),
      } as Movie;

      jest.spyOn(movieService, 'getMovieById').mockResolvedValue(movie);

      const result = await movieController.getMovieById(movieId);

      expect(movieService.getMovieById).toHaveBeenCalledWith(movieId);
      expect(result).toEqual(new SuccessClass(movie));
    });
  });

  describe('editMovie', () => {
    it('should update a movie and return a success response', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };
      const editDto: EditDto = {
        title: "New movie title",
      };

      jest.spyOn(movieService, 'editMovie').mockResolvedValue(undefined);

      const result = await movieController.editMovie(movieId, editDto, user);

      expect(movieService.editMovie).toHaveBeenCalledWith(movieId, editDto, user);
      expect(result).toEqual(
        new SuccessClass({ id: movieId }, 'movie is updated successfully'),
      );
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie and return a success response', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };

      jest.spyOn(movieService, 'deleteMovie').mockResolvedValue(undefined);

      const result = await movieController.deleteMovie(movieId, user);

      expect(movieService.deleteMovie).toHaveBeenCalledWith(movieId, user);
      expect(result).toEqual(new SuccessClass({}, 'movie is deleted successfully'));
    });
  });
});
