import { Module } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { TmdbCronService } from './tmdb-cron.service';
import { MovieModule } from '../movie/movie.module';
import { GenreModule } from '../genre/genre.module';

@Module({
  imports: [MovieModule, GenreModule],
  providers: [TmdbService, TmdbCronService],
  controllers: [],
  exports: [],
})
export class TmdbModule {}
