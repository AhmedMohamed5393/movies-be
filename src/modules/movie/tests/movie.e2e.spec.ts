import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { MovieController } from '../movie.controller';
import { MovieService } from '../movie.service';
import { AddDto, EditDto } from '../dtos/index.dto';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { AuthGuard } from '@shared/guards/index.guard';
import { Reflector } from '@nestjs/core';
import { SuccessClass } from '@shared/classes/success.class';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { Movie } from '../entities/movie.entity';

describe('MovieController (e2e)', () => {
  let app: INestApplication;
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

    app = module.createNestApplication();
    await app.init();

    movieService = module.get<MovieService>(MovieService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /movies', () => {
    it('should create a new movie and return a success response', async () => {
      const addDto: AddDto = {
        title: "New movie title",
        overview: "New movie overview",
      };

      const savedMovie = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        ...addDto,
      } as Movie;

      jest.spyOn(movieService, 'saveNewMovie').mockResolvedValue(savedMovie);

      const response = await request(app.getHttpServer())
        .post('/movies')
        .send(addDto)
        .expect(201);

      expect(response.body).toEqual(
        new SuccessClass(savedMovie, 'movie is created successfully'),
      );
    });
  });

  describe('GET /movies', () => {
    it('should return a paginated list of movies', async () => {
      const pageOptionsDto = {
        page: 1,
        take: 10,
        search: 'Samsung',
      } as PageOptionsDto;

      const movies = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "New movie post",
          content: "Hi everyone",
          tags: ["Welcome_onboard"],
          user: {
            id: "550e8400-e29b-41d4-a716-446655440044",
            email: "ahmedmohamedalex93@gmail.com",
          },
          created_at: new Date().toISOString(),
        },
      ] as any[];

      const meta = {
        itemsPerPage: movies.length,
        total: 1,
        pageOptionsDto,
      } as unknown as PageMetaDto;

      jest.spyOn(movieService, 'getMovies').mockResolvedValue({ meta, movies });

      const response = await request(app.getHttpServer())
        .get('/movies')
        .query(pageOptionsDto)
        .expect(200);

      expect(response.body).toEqual(new SuccessClass({ meta, movies }));
    });
  });

  describe('GET /movies/:id', () => {
    it('should return a movie by ID', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";
      const movie = {
        id: movieId,
        title: "New movie post",
        content: "Hi everyone",
        tags: ["Welcome_onboard"],
        user: {
          id: "550e8400-e29b-41d4-a716-446655440044",
          email: "ahmedmohamedalex93@gmail.com",
        },
        created_at: new Date().toISOString(),
      } as any as Movie;

      jest.spyOn(movieService, 'getMovieById').mockResolvedValue(movie);

      const response = await request(app.getHttpServer())
        .get(`/movies/${movieId}`)
        .expect(200);

      expect(response.body).toEqual(new SuccessClass(movie));
    });

    it('should return 404 if movie is not found', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440001";

      jest.spyOn(movieService, 'getMovieById').mockImplementationOnce(() => {
        throw new NotFoundException('Movie is not found');
      });

      const response = await request(app.getHttpServer())
        .get(`/movies/${movieId}`)
        .expect(404);

      expect(response.body.message).toBe('Movie is not found');
    });
  });

  describe('PUT /movies/:id', () => {
    it('should update a movie and return a success response', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";
      const editDto: EditDto = {
        title: "New movie post",
      };

      jest.spyOn(movieService, 'editMovie').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .put(`/movies/${movieId}`)
        .send(editDto)
        .expect(200);

      expect(response.body).toEqual(
        new SuccessClass({ id: movieId }, 'movie is updated successfully'),
      );
    });

    it('should return 404 if movie is not found', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440001";
      const editDto: EditDto = {
        title: "New movie post",
      };

      jest.spyOn(movieService, 'editMovie').mockRejectedValue(new NotFoundException('Movie is not found'));

      const response = await request(app.getHttpServer())
        .put(`/movies/${movieId}`)
        .send(editDto)
        .expect(404);

      expect(response.body.message).toBe('Movie is not found');
    });
  });

  describe('DELETE /movies/:id', () => {
    it('should delete a movie and return a success response', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440000";

      jest.spyOn(movieService, 'deleteMovie').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete(`/movies/${movieId}`)
        .expect(200);

      expect(response.body).toEqual(
        new SuccessClass({}, 'movie is deleted successfully'),
      );
    });

    it('should return 404 if movie is not found', async () => {
      const movieId = "550e8400-e29b-41d4-a716-446655440001";

      jest.spyOn(movieService, 'deleteMovie').mockRejectedValue(new NotFoundException('Movie is not found'));

      const response = await request(app.getHttpServer())
        .delete(`/movies/${movieId}`)
        .expect(404);

      expect(response.body.message).toBe('Movie is not found');
    });
  });
});
