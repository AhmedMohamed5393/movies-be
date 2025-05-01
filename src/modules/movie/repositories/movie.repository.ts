import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { MovieRepositoryInterface } from './interfaces/movie.repository.interface';
import { BaseRepository } from '@shared/repositories/base.repository';

@Injectable()
export class MovieRepository
  extends BaseRepository<Movie>
  implements MovieRepositoryInterface
{
  constructor(@InjectRepository(Movie) movieRepository: Repository<Movie>) {
    super(movieRepository);
  }
}
