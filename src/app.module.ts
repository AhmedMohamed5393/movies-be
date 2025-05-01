import { Module } from '@nestjs/common'; 
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './modules/logging/logging.module';
import { MovieModule } from './modules/movie/movie.module';
import { WatchListModule } from './modules/watchlist/watchlist.module';
import { RatingModule } from './modules/rating/rating.module';
import { UserModule } from './modules/user/user.module';
import { GenreModule } from './modules/genre/genre.module';
import { TmdbModule } from './modules/tmdb/tmdb.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LoggingModule,
    MovieModule,
    WatchListModule,
    RatingModule,
    UserModule,
    GenreModule,
    TmdbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
