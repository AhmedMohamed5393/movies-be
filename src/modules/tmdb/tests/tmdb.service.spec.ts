import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { GenreService } from 'src/modules/genre/genre.service';
import { MovieService } from 'src/modules/movie/movie.service';
import { TmdbService } from '../tmdb.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TmdbService', () => {
  let service: TmdbService;
  let genreService: GenreService;
  let movieService: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: GenreService,
          useValue: {
            saveNewGenre: jest.fn(),
            findByIds: jest.fn(),
          },
        },
        {
          provide: MovieService,
          useValue: {
            checkExistenceById: jest.fn(),
            saveNewMovie: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
    genreService = module.get<GenreService>(GenreService);
    movieService = module.get<MovieService>(MovieService);

    // Set environment variables used by the service
    process.env.TMDB_API_KEY = 'dummy-key';
    process.env.TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncGenres', () => {
    it('should fetch genres from TMDB and save them', async () => {
      const fakeGenres = {
        data: {
          genres: [
            { id: 1, name: 'Action' },
            { id: 2, name: 'Drama' },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(fakeGenres);

      await service.syncGenres();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=dummy-key`,
      );
      expect(genreService.saveNewGenre).toHaveBeenCalledTimes(2);
      expect(genreService.saveNewGenre).toHaveBeenCalledWith('Action');
      expect(genreService.saveNewGenre).toHaveBeenCalledWith('Drama');
    });
  });

  describe('syncPopularMovies', () => {
    it('should fetch popular movies and save new ones', async () => {
      const fakeMovies = {
        data: {
          results: [
            {
              id: 101,
              title: 'Movie A',
              overview: 'Overview A',
              poster_path: '/pathA.jpg',
              release_date: '2024-01-01',
              genre_ids: ['1'],
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(fakeMovies);
      (movieService.checkExistenceById as jest.Mock).mockResolvedValue(false);
      (genreService.findByIds as jest.Mock).mockResolvedValue([{ id: '1' }]);

      await service.syncPopularMovies();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.themoviedb.org/3/movie/popular?api_key=dummy-key`,
      );
      expect(movieService.checkExistenceById).toHaveBeenCalledWith(101);
      expect(genreService.findByIds).toHaveBeenCalledWith(['1']);
      expect(movieService.saveNewMovie).toHaveBeenCalledWith({
        title: 'Movie A',
        overview: 'Overview A',
        poster_path: '/pathA.jpg',
        release_date: '2024-01-01',
        genres: [{ id: '1' }],
      });
    });

    it('should not save existing movies', async () => {
      const fakeMovies = {
        data: {
          results: [
            {
              id: 102,
              title: 'Movie B',
              overview: 'Overview B',
              poster_path: '/pathB.jpg',
              release_date: '2024-01-02',
              genre_ids: ['2'],
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(fakeMovies);
      (movieService.checkExistenceById as jest.Mock).mockResolvedValue(true);

      await service.syncPopularMovies();

      expect(movieService.saveNewMovie).not.toHaveBeenCalled();
    });
  });
});
