import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module'; // Adjust path as necessary
import { MovieFilterOptionsDto } from '../dtos/index.dto';
import { AuthGuard } from '@shared/guards/auth.guard';
import { MockAuthGuard } from '@shared/tests/mock-auth.guard';
import { MovieService } from '../movie.service';
import { Movie } from '../entities/movie.entity';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { GetMoviesResponseInterface } from '../interfaces/get-movies-response.interface';
import { WatchListItem } from 'src/modules/watchlist/entities/wishlist.entity';
import { Rating } from 'src/modules/rating/entities/rating.entity';

describe('MovieController (e2e)', () => {
  let app: INestApplication;
  let service: MovieService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    })
    .overrideGuard(AuthGuard)
    .useValue(MockAuthGuard)
    .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    service = moduleRef.get<MovieService>(MovieService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/movies (GET)', () => {
    it('should return paginated movies', async () => {
        const query = { page: 1, take: 10 } as MovieFilterOptionsDto;

        const mockPageOptionsDto = {
            page: 1,
            take: 10,
            search: '',
        } as PageOptionsDto;
        
        const mockMovies = [
            { id: 'm1', title: 'Movie 1', poster: { id: 'u1' } },
            { id: 'm2', title: 'Movie 2', poster: { id: 'u2' } },
        ] as Movie[];
        
        const mockPaginatedResponse = {
            movies: mockMovies,
            meta: {
                total: 2,
                itemsPerPage: 2,
                pageOptionsDto: mockPageOptionsDto,
            } as unknown as PageMetaDto,
        } as unknown as GetMoviesResponseInterface;

        jest.spyOn(service, 'getMovies').mockResolvedValueOnce(mockPaginatedResponse);

        const response = await request(app.getHttpServer()).get('/movies').query(query);

        expect(response.status).toBe(200);
        expect(response.body.data.movies).toBeInstanceOf(Array);
    });
  });

  describe('/movies/:id (GET)', () => {
    it('should return movie by ID', async () => {
        // You can mock movie data or ensure a movie exists before this test
        const movieId = 'm1'; // Replace with a real/test ID

        const mockResponse = {
            id: 'm1',
            title: 'Movie 1', poster: { id: 'u1' },
        } as Movie;

        jest.spyOn(service, 'getMovieById').mockResolvedValueOnce(mockResponse);

        const response = await request(app.getHttpServer()).get(`/movies/${movieId}`);

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(movieId);
    });
  });

  describe('/movies/watchlist (POST)', () => {
    it('should add a movie to user watchlist', async () => {
      const payload = {
        movie_id: '550e8400-e29b-41d4-a716-446655440000', // Replace with valid ID
      };

      const mockResponse = { id: 'watchlist1' } as WatchListItem;

      jest.spyOn(service, 'addMovieItemToWatchList').mockResolvedValueOnce(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/movies/watchlist')
        .send(payload);

      expect(response.status).toBe(201);
    });
  });

  describe('/movies/rate (POST)', () => {
    it('should allow user to rate a movie', async () => {
      const payload = {
        movie_id: '550e8400-e29b-41d4-a716-446655440000', // Replace with valid ID
        rating: 5,
      };

      const mockResponse = { id: 'rating1', value: 5 } as Rating;

      jest.spyOn(service, 'addRatingToMovie').mockResolvedValueOnce(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/movies/rate')
        .send(payload);

      expect(response.status).toBe(201);
    });
  });
});
