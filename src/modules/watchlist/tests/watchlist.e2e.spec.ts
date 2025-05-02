import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { WatchListService } from '../watchlist.service';
import { AppModule } from 'src/app.module';
import { AuthGuard } from '@shared/guards/auth.guard';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { WatchListItem } from '../entities/wishlist.entity';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { MockAuthGuard } from '@shared/tests/mock-auth.guard';

describe('WatchListController (e2e)', () => {
  let app: INestApplication;
  let service: WatchListService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    service = moduleFixture.get<WatchListService>(WatchListService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/watchlist (GET) should return watchlist', async () => {    
    const mockPageOptionsDto = {
        page: 1,
        take: 10,
        search: '',
    } as PageOptionsDto;
    
    const mockWatchListItems = [
        { id: '1', movie: { id: 'm1', title: 'Movie 1' } },
        { id: '2', movie: { id: 'm2', title: 'Movie 2' } },
    ] as WatchListItem[];
    
    const mockPaginatedResponse = {
        items: mockWatchListItems,
        meta: {
            total: 2,
            itemsPerPage: 2,
            pageOptionsDto: mockPageOptionsDto,
        } as unknown as PageMetaDto,
    };
    
    jest.spyOn(service, 'getWatchListItems').mockResolvedValueOnce(mockPaginatedResponse);

    const response = await request(app.getHttpServer()).get('/watchlist');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockPaginatedResponse);
  });

  it('/watchlist/:id (DELETE) should remove an item', async () => {
    const itemId = '1';
    jest.spyOn(service, 'removeItemFromWishList').mockImplementation();

    const response = await request(app.getHttpServer()).delete(`/watchlist/${itemId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('The watchlist item is removed successfully');
  });
});
