import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { WatchListItem } from '../entities/wishlist.entity';
import { WatchListRepositoryInterface } from './interfaces/watchlist.repository.interface';

@Injectable()
export class WatchListRepository
  extends BaseRepository<WatchListItem>
  implements WatchListRepositoryInterface
{
  constructor(@InjectRepository(WatchListItem) watchlistRepository: Repository<WatchListItem>) {
    super(watchlistRepository);
  }
}
