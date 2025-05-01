import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { GenreRepository } from './repositories/genre.repository';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(private readonly genreRepository: GenreRepository) {}

  async saveNewGenre(name: string): Promise<Genre> {
    const newGenre = new Genre();
    newGenre.name = name;
    return await this.genreRepository.save(newGenre);
  }

  async findByIds(ids: string[]) {
    return await this.genreRepository.find({
        where: { id: In(ids) },
        select: { id: true },
    })
  }
}
