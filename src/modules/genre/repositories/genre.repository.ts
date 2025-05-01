import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { Genre } from '../entities/genre.entity';
import { GenreRepositoryInterface } from './interfaces/genre.repository.interface';

@Injectable()
export class GenreRepository
  extends BaseRepository<Genre>
  implements GenreRepositoryInterface
{
  constructor(@InjectRepository(Genre) genreRepository: Repository<Genre>) {
    super(genreRepository);
  }
}
