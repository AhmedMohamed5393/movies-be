import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { GenreService } from '../genre/genre.service';
import { MovieService } from '../movie/movie.service';
import { CreateMovieInterface } from '../movie/interfaces/create-movie.interface';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly TMDB_API_KEY = process.env.TMDB_API_KEY;
  private readonly TMDB_BASE_URL = process.env.TMDB_BASE_URL;

  constructor(
    private readonly genreService: GenreService,
    private readonly movieService: MovieService,
  ) {}

  async syncGenres(): Promise<void> {
    const url = `${this.TMDB_BASE_URL}/genre/movie/list?api_key=${this.TMDB_API_KEY}`;
    const { data } = await axios.get(url);
    for (const genre of data.genres) {
      await this.genreService.saveNewGenre(genre.name);
    }

    this.logger.log('Genres synced');
  }

  async syncPopularMovies(): Promise<void> {
    const url = `${this.TMDB_BASE_URL}/movie/popular?api_key=${this.TMDB_API_KEY}`;
    const { data } = await axios.get(url);
    for (const movie of data.results) {
      const existing = await this.movieService.checkExistenceById(movie.id);
      const genres = await this.genreService.findByIds(movie.genre_ids);
      
      const payload: CreateMovieInterface = {
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        genres: genres,
      };
      if (!existing) {
        await this.movieService.saveNewMovie(payload);
      }
    }

    this.logger.log('Popular movies synced');
  }
}
