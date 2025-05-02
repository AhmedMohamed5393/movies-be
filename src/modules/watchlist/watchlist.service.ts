import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { WatchListRepository } from './repositories/watchlist.repository';
import { WatchListItem } from './entities/wishlist.entity';
import { Movie } from '../movie/entities/movie.entity';
import { User } from '../user/entities/user.entity';
import { AddToWatchListPayloadInterface } from './interfaces/add-to-watchlist.interface';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { ILike } from 'typeorm';

@Injectable()
export class WatchListService {
  constructor(
    private readonly watchListRepository: WatchListRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async saveNewWatchListItem(payload: AddToWatchListPayloadInterface) {
    const newItem = new WatchListItem();
    newItem.movie = { id: payload.movie_id } as Movie;
    newItem.user = { id: payload.user_id } as User;
    const watchlistItem = await this.watchListRepository.save(newItem);

    await this.loggingService.createLog({
      title: 'Added new watchlist item',
      action: `Added a movie to user's watchlist with id "${payload.movie_id}"`,
      entity: 'WatchListItem',
      user_id: payload.user_id,
    });

    return watchlistItem;
  }

  async getWatchListItems(pageOptionsDto: PageOptionsDto, user_id: string) {
    const { page, take, search } = pageOptionsDto;
    const skip = (page - 1) * take || 0;

    const filterBy = { user: { id: user_id } };

    const where: any = search
      ? [
          { movie: { title: ILike(`%${pageOptionsDto.search}%`) }, ...filterBy },
          { movie: { overview: ILike(`%${pageOptionsDto.search}%`) }, ...filterBy },
        ]
      : { ...filterBy };

    const [items, total] = await this.watchListRepository.findAndCount({
      select: {
        id: true,
        movie: { id: true, title: true },
        created_at: true,
      },
      relations: { movie: { ratings: true } },
      take: take,
      skip: skip,
      where: where,
      order: { created_at: 'DESC' },
    });

    const meta = new PageMetaDto({
      itemsPerPage: items.length,
      total: total,
      pageOptionsDto: pageOptionsDto,
    });

    return { meta, items };
  }

  async removeItemFromWishList(id: string, user_id: string) {
    const isExist = await this.watchListRepository.isExist({ id: id, user: { id: user_id } });
    if (!isExist) {
      throw new NotFoundException('The watchlist item is not found');
    }

    await this.watchListRepository.softDelete(id);

    await this.loggingService.createLog({
      title: 'Remove an item from watchlist',
      action: `Remove an item from user's watchlist with id "${id}"`,
      entity: 'WatchListItem',
      user_id: user_id,
    });
  }
}
