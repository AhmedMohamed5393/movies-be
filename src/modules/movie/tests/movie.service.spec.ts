import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { AddDto, EditDto } from '../dtos/index.dto';
import { MovieService } from '../movie.service';
import { LoggingService } from '../../logging/logging.service';
import { Movie } from '../entities/movie.entity';
import { MovieRepository } from '../repositories/movie.repository';

describe('MovieService', () => {
  let movieService: MovieService;
  let movieRepository: MovieRepository;
  let loggingService: LoggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: MovieRepository,
          useValue: {
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            isExist: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            createLog: jest.fn(),
          },
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    movieRepository = module.get<MovieRepository>(MovieRepository);
    loggingService = module.get<LoggingService>(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(movieService).toBeDefined();
  });

  describe('saveNewMovie', () => {
    it('should save a new movie and create a log', async () => {
      const addDto: AddDto = {
        title: "New movie title",
        overview: "New movie overview",
      };

      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };
      const savedMovie = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        ...addDto,
        created_at: new Date(),
      } as Movie;

      jest.spyOn(movieRepository, 'save').mockResolvedValue(savedMovie);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      const result = await movieService.saveNewMovie(addDto, user);

      expect(movieRepository.save).toHaveBeenCalledWith(expect.any(Movie));
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Added new movie',
        action: `Added new movie with title "${addDto.title}"`,
        entity: 'Movie',
        user_id: user.id,
      });
      expect(result).toEqual(savedMovie);
    });
  });

  describe('getMovies', () => {
    it('should return a paginated list of movies', async () => {
      const pageOptionsDto = {
        page: 1,
        take: 10,
        search: 'movie',
      } as PageOptionsDto;

      const movies = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "New movie title",
          overview: "New movie overview",
          poster: {
            id: "550e8400-e29b-41d4-a716-446655440044",
            email: "ahmedmohamedalex93@gmail.com",
          },
          created_at: new Date(),
        },
      ] as Movie[];

      const total = 1;
      const meta = new PageMetaDto({
        itemsPerPage: movies.length,
        total,
        pageOptionsDto,
      });

      jest.spyOn(movieRepository, 'findAndCount').mockResolvedValue([movies, total]);

      const result = await movieService.getMovies(pageOptionsDto);

      expect(movieRepository.findAndCount).toHaveBeenCalledWith({
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          user: { id: true, email: true },
          created_at: true,
        },
        relations: { user: true },
        take: pageOptionsDto.take,
        skip: 0,
        where: [
          { title: expect.any(Object) },
          { content: expect.any(Object) },
          { tags: expect.any(Object) },
        ],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual({ meta, movies });
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

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);

      const result = await movieService.getMovieById(movieId);

      expect(movieRepository.findOne).toHaveBeenCalledWith({
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          user: { id: true, email: true },
          created_at: true,
        },
        relations: { user: true },
        where: { id: movieId },
      });
      expect(result).toEqual(movie);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);

      await expect(movieService.getMovieById(movieId)).rejects.toThrow(
        new NotFoundException({ message: 'Movie is not found' }),
      );
    });
  });

  describe('editMovie', () => {
    it('should update a movie and create a log', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };
      const editDto: EditDto = {
        title: "New movie title",
      };

      const originalMovie = {
        id: movieId,
        title: "Movie title",
        overview: "Movie overview",
      } as Movie;

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(originalMovie);
      jest.spyOn(movieRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      await movieService.editMovie(movieId, editDto, user);

      expect(movieRepository.findOne).toHaveBeenCalledWith({
        where: { id: movieId },
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
        },
      });
      expect(movieRepository.update).toHaveBeenCalledWith({
        where: { id: movieId },
        data: {
          title: editDto.title || originalMovie.title,
          overview: editDto.overview || originalMovie.overview,
        },
      });
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Edited movie',
        action: `Edited movie with changes: title changed from "${originalMovie.title}" to "${editDto.title}"`,
        entity: 'Movie',
        user_id: user.id,
      });
    });

    it('should throw NotFoundException if movie is not found', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440001";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };
      const editDto: EditDto = {
        title: "New movie title",
      };

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);

      await expect(movieService.editMovie(movieId, editDto, user)).rejects.toThrow(
        new NotFoundException({ message: 'Movie is not found' }),
      );
    });
  });

  describe('deleteMovie', () => {
    it('should soft delete a movie and create a log', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };

      jest.spyOn(movieRepository, 'isExist').mockResolvedValue(true);
      jest.spyOn(movieRepository, 'softDelete').mockResolvedValue(undefined);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      await movieService.deleteMovie(movieId, user);

      expect(movieRepository.isExist).toHaveBeenCalledWith({ id: movieId });
      expect(movieRepository.softDelete).toHaveBeenCalledWith(movieId);
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Deleted movie',
        action: `Deleted movie with ID: ${movieId}`,
        entity: 'Movie',
        user_id: user.id,
      });
    });

    it('should throw NotFoundException if movie is not found', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440001";
      const user = {
        id: "550e8400-e29b-41d4-a716-446655440044",
      };

      jest.spyOn(movieRepository, 'isExist').mockResolvedValue(false);

      await expect(movieService.deleteMovie(movieId, user)).rejects.toThrow(
        new NotFoundException({ message: 'Movie is not found' }),
      );
    });
  });
});
