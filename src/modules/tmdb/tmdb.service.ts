import { Injectable, Logger } from '@nestjs/common';
import { GenreService } from '../genre/genre.service';
import { MovieService } from '../movie/movie.service';
import { HttpClient } from '@shared/http/http-client';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private httpClient: HttpClient;

  constructor(
    private readonly genreService: GenreService,
    private readonly movieService: MovieService,
  ) {
    this.httpClient = new HttpClient();
  }

  async syncGenres(): Promise<void> {
    const data = await this.httpClient.get('/genre/movie/list');

    for (const genre of data.genres) {
      await this.genreService.saveNewGenre(genre.id.toString(), genre.name);
    }

    this.logger.log('Genres synced');
  }

  async syncPopularMovies(): Promise<void> {
    const data = await this.httpClient.get('/movie/popular');

    for (const movie of data.results) {
      // check existence of movie item by tmdb id (id in tmdb database not ours)
      const existing = await this.movieService.checkExistenceById(movie.id);
      // the same here for genre items
      const genres = await this.genreService.findByIds(movie.genre_ids);
      
      if (!existing) {
        await this.movieService.saveNewMovie({
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          genres: genres,
          // use tmdb id to store it while inserting movie item to our database
          tmdb_id: movie.id.toString(),
        });
      }
    }

    this.logger.log('Popular movies synced');
  }
}
