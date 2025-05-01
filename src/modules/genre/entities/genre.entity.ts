import { Base } from '@shared/entities/base.entity';
import { Movie } from 'src/modules/movie/entities/movie.entity';
import { Entity, Column, ManyToMany } from 'typeorm';

@Entity({ name: 'genres' })
export class Genre extends Base {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies: Movie[];
}
