import { Base } from '@shared/entities/base.entity';
import { Exclude, Expose } from 'class-transformer';
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

  @Exclude()
  @OneToMany(() => Rating, (rating) => rating.movie, { cascade: true })
  ratings: Rating[];

  @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: true })
  @JoinTable()
  genres: Genre[];
  
  @Exclude()
  @OneToMany(() => WatchListItem, (watchListItem) => watchListItem.movie)
  watchListItems: WatchListItem[];

  @Expose()
  get avg_rating() {
    if (!this.ratings?.length) return 0;

    // calculate average rates applied on certain movie approximated to tenth digit
    const total = this.ratings.reduce((sum, rating) => sum + rating.value, 0);
    return parseFloat((total / this.ratings.length).toFixed(1));
  }
}
