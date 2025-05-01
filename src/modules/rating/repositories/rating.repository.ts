import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { RatingRepositoryInterface } from './interfaces/rating.repository.interface';
import { BaseRepository } from '@shared/repositories/base.repository';

@Injectable()
export class RatingRepository
  extends BaseRepository<Rating>
  implements RatingRepositoryInterface
{
  constructor(@InjectRepository(Rating) ratingRepository: Repository<Rating>) {
    super(ratingRepository);
  }
}
