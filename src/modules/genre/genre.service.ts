import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { GenreRepository } from './repositories/genre.repository';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(private readonly genreRepository: GenreRepository) {}

  async saveNewGenre(tmdb_id: string, name: string): Promise<Genre> {
    const newGenre = new Genre();
    newGenre.tmdb_id = tmdb_id;
    newGenre.name = name;
    return await this.genreRepository.save(newGenre);
  }

  async findByIds(tmdb_ids: string[]) {
    return await this.genreRepository.find({
        where: { tmdb_id: In(tmdb_ids) },
        select: { id: true },
    })
  }
}
