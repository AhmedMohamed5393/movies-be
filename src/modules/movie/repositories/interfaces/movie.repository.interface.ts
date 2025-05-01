import { BaseRepositoryInterface } from '@shared/repositories/interfaces/base.repository.interface';
import { Movie } from '../../entities/movie.entity';

export type MovieRepositoryInterface = BaseRepositoryInterface<Movie>;
