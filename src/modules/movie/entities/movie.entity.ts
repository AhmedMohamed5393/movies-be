import { Base } from '@shared/entities/base.entity';
import { Exclude } from 'class-transformer';
import { Genre } from 'src/modules/genre/entities/genre.entity';
import { Rating } from 'src/modules/rating/entities/rating.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { WatchListItem } from 'src/modules/watchlist/entities/wishlist.entity';
import { Entity, Column, ManyToOne, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity({ name: 'movies' })
export class Movie extends Base {
  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  overview: string;

  @Column({ nullable: true })
  poster_path: string;

  @Column({ nullable: true })
  release_date: string;

  @ManyToOne(() => User, (user) => user.movies)
  poster: User;

  @OneToMany(() => Rating, (rating) => rating.movie, { cascade: true })
  ratings: Rating[];

  @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: true })
  @JoinTable()
  genres: Genre[];
  
  @Exclude()
  @OneToMany(() => WatchListItem, (watchListItem) => watchListItem.movie)
  watchListItems: WatchListItem[];
}
