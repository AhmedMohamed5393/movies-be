import { ConflictException, Injectable } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { RatingRepository } from './repositories/rating.repository';
import { RateMoviePayloadInterface } from './interfaces/rate-movie.interface';
import { Rating } from './entities/rating.entity';
import { Movie } from '../movie/entities/movie.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class RatingService {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async addRating(payload: RateMoviePayloadInterface) {
    const rating = await this.ratingRepository.findOne({
      where: {
        user: { id: payload.user_id },
        movie: { id: payload.movie_id },
      },
    });
    let data: Rating, log_action: string;
    if (!rating) {
      const newRating = new Rating();
      newRating.movie = { id: payload.movie_id } as Movie;
      newRating.user = { id: payload.user_id } as User;
      newRating.value = payload.value;

      data = await this.ratingRepository.save(newRating);

      log_action = 'Added';
    } else {
      if (rating.value === payload.value) {
        throw new ConflictException('already has the same rating value');
      }

      await this.ratingRepository.update({
        where: { id: rating.id },
        data: { value: payload.value },
      });

      rating.value = payload.value;
      data = rating;

      log_action = 'Edited';
    }

    await this.loggingService.createLog({
      title: `${log_action} a movie rating`,
      action: `${log_action} rating a movie with id "${payload.movie_id}" with value ${payload.value}`,
      entity: 'Rating',
      user_id: payload.user_id,
    });

    return data;
  }
}
