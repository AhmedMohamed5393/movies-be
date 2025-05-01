import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TmdbService } from './tmdb.service';

@Injectable()
export class TmdbCronService {
  constructor(private readonly tmdbService: TmdbService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySync() {
    await this.tmdbService.syncGenres();
    await this.tmdbService.syncPopularMovies();
  }
}
