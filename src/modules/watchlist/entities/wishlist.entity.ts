import { Base } from '@shared/entities/base.entity';
import { Exclude } from 'class-transformer';
import { Movie } from 'src/modules/movie/entities/movie.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'watchlist_items' })
export class WatchListItem extends Base {
  @Exclude()
  @ManyToOne(() => User, (user) => user.watchListItems)
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.watchListItems)
  movie: Movie;
}
