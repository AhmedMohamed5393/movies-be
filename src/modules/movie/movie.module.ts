import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieRepository } from './repositories/movie.repository';
import { Movie } from './entities/movie.entity';
import { WatchListModule } from '../watchlist/watchlist.module';
import { RatingModule } from '../rating/rating.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    LoggingModule,
    WatchListModule,
    RatingModule,
  ],
  controllers: [MovieController],
  providers: [MovieService, MovieRepository],
  exports: [MovieService],
})
export class MovieModule {}
