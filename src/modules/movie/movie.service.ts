import { Injectable, NotFoundException } from '@nestjs/common';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { ILike } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { MovieRepository } from './repositories/movie.repository';
import { WatchListService } from '../watchlist/watchlist.service';
import {
  AddRatingToMovieDto,
  AddToWatchListDto,
  MovieFilterOptionsDto,
} from './dtos/index.dto';
import { RatingService } from '../rating/rating.service';
import { CreateMovieInterface } from './interfaces/create-movie.interface';
import { RedisService } from '@shared/redis/redis.service';
import { GetMoviesResponseInterface } from './interfaces/get-movies-response.interface';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly watchListService: WatchListService,
    private readonly ratingService: RatingService,
    private readonly redisService: RedisService,
  ) {}

  async addMovieItemToWatchList(
    addToWatchListDto: AddToWatchListDto,
    user_id: string,
  ) {
    return await this.watchListService.saveNewWatchListItem({
      user_id: user_id,
      movie_id: addToWatchListDto.movie_id,
    });
  }

  async addRatingToMovie(
    addRatingToMovieDto: AddRatingToMovieDto,
    user_id: string,
  ) {
    return await this.ratingService.addRating({
      user_id: user_id,
      movie_id: addRatingToMovieDto.movie_id,
      value: addRatingToMovieDto.rating,
    });
  }

  async getMovies(movieFilterOptionsDto: MovieFilterOptionsDto) {
    const { page, take, search, genre_name, genre_id } = movieFilterOptionsDto;
    const skip = (page - 1) * take || 0;

    const filterBy = { genres: {} };
    if (genre_name?.length) {
      filterBy['genres']['name'] = genre_name;
    }
    if (genre_id?.length) {
      filterBy['genres']['id'] = genre_id;
    }

    const where: any = search
      ? [
          { title: ILike(`%${movieFilterOptionsDto.search}%`), ...filterBy },
          { overview: ILike(`%${movieFilterOptionsDto.search}%`), ...filterBy },
        ]
      : { ...filterBy };

    // Check cache
    const key = `movies:page=${page}:take=${take}:search=${search || ''}:genre_name=${genre_name || ''}:genre_id=${genre_id || ''}`;
    
    const cached = await this.redisService.get<GetMoviesResponseInterface>(key);
    if (cached) return cached;
    
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
    
    const response = { meta, movies };
    
    // Cache result for 5 minutes
    await this.redisService.set(key, response, 5 * 60);

    return response;
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
      relations: {
        poster: true,
        genres: true,
        ratings: { user: true },
      },
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
