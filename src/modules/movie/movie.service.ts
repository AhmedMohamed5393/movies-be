import { Injectable, NotFoundException } from '@nestjs/common';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { ILike } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { MovieRepository } from './repositories/movie.repository';
import { WatchListService } from '../watchlist/watchlist.service';
import { WatchListItem } from '../watchlist/entities/wishlist.entity';
import {
  AddRatingToMovieDto,
  AddToWatchListDto,
  MovieFilterOptionsDto,
} from './dtos/index.dto';
import { RatingService } from '../rating/rating.service';
import { CreateMovieInterface } from './interfaces/create-movie.interface';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly watchListService: WatchListService,
    private readonly ratingService: RatingService,
  ) {}

  async addMovieItemToWatchList(
    addToWatchListDto: AddToWatchListDto,
    user_id: string,
  ): Promise<WatchListItem> {
    return await this.watchListService.saveNewWatchListItem({
      user_id: user_id,
      movie_id: addToWatchListDto.movie_id,
    });
  }

  async addRatingToMovie(
    addRatingToMovieDto: AddRatingToMovieDto,
    user_id: string,
  ): Promise<WatchListItem> {
    return await this.ratingService.addRating({
      user_id: user_id,
      movie_id: addRatingToMovieDto.movie_id,
      value: addRatingToMovieDto.rating,
    });
  }

  async getMovies(movieFilterOptionsDto: MovieFilterOptionsDto) {
    const { page, take, search, genre } = movieFilterOptionsDto;
    const skip = (page - 1) * take || 0;

    const filterBy = {};
    if (genre?.length) {
      filterBy['genres'] = { name: genre };
    }

    const where = search
      ? [
          { title: ILike(`%${movieFilterOptionsDto.search}%`), ...filterBy },
          { overview: ILike(`%${movieFilterOptionsDto.search}%`), ...filterBy },
        ]
      : { ...filterBy };

    const [movies, total] = await this.movieRepository.findAndCount({
      select: {
        id: true,
        title: true,
        overview: true,
        release_date: true,
        poster: { id: true, email: true },
        genres: { id: true, name: true },
        created_at: true,
      },
      relations: { poster: true, genres: true },
      take: take,
      skip: skip,
      where: where,
      order: { created_at: 'DESC' },
    });

    const meta = new PageMetaDto({
      itemsPerPage: movies.length,
      total: total,
      pageOptionsDto: movieFilterOptionsDto,
    });

    return { meta, movies };
  }

  async getMovieById(id: string): Promise<Movie> {
    const where = { id };

    const movie = await this.movieRepository.findOne({
      select: {
        id: true,
        title: true,
        overview: true,
        poster_path: true,
        release_date: true,
        poster: { id: true, email: true },
        genres: { id: true, name: true },
        ratings: {
          id: true,
          value: true,
          user: { id: true, email: true },
        },
        created_at: true,
      },
      relations: { poster: true },
      where: where,
    });
    if (!movie) {
      throw new NotFoundException({ message: 'Movie is not found' });
    }

    return movie;
  }

  async saveNewMovie(payload: CreateMovieInterface) {
    const newMovie = new Movie();
    newMovie.title = payload.title;
    newMovie.overview = payload.overview;
    newMovie.poster_path = payload.poster_path;
    newMovie.release_date = payload.release_date;
    newMovie.genres = payload.genres;

    return await this.movieRepository.save(newMovie);
  }

  async checkExistenceById(id: string) {
    return await this.movieRepository.isExist({ id });
  }
}
