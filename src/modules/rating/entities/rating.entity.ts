import { Base } from '@shared/entities/base.entity';
import { Movie } from 'src/modules/movie/entities/movie.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'ratings' })
export class Rating extends Base {
  @Column({ type: 'float' })
  value: number;

  @ManyToOne(() => Movie, (movie) => movie.ratings)
  movie: Movie;

  @ManyToOne(() => User, (user) => user.ratings)
  user: User;
}
