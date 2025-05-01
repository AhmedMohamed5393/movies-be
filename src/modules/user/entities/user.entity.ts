import { Column, Entity, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Base } from '@shared/entities/base.entity';
import { Movie } from 'src/modules/movie/entities/movie.entity';
import { Rating } from 'src/modules/rating/entities/rating.entity';
import { WatchListItem } from 'src/modules/watchlist/entities/wishlist.entity';

@Entity({ name: 'users' })
export class User extends Base {
  @Exclude()
  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @OneToMany(() => Movie, (movie) => movie.poster, { cascade: true })
  movies: Movie[];

  @OneToMany(() => Rating, (rating) => rating.user, { cascade: true })
  ratings: Rating[];

  @Exclude()
  @OneToMany(() => WatchListItem, (watchListItem) => watchListItem.user)
  watchListItems: WatchListItem[];
}
