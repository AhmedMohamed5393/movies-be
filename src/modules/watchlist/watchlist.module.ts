import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchListRepository } from './repositories/watchlist.repository';
import { WatchListController } from './watchlist.controller';
import { WatchListService } from './watchlist.service';
import { WatchListItem } from './entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WatchListItem]), LoggingModule],
  controllers: [WatchListController],
  providers: [WatchListService, WatchListRepository],
  exports: [WatchListService],
})
export class WatchListModule {}
