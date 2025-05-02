import { Test, TestingModule } from '@nestjs/testing';
import { WatchListController } from '../watchlist.controller';
import { WatchListService } from '../watchlist.service';
import { MockAuthGuard } from '@shared/tests/mock-auth.guard';
import { AuthGuard } from '@shared/guards/index.guard';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { WatchListItem } from '../entities/wishlist.entity';
import { SuccessClass } from '@shared/classes/success.class';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';

const mockUserId = 'test-user-id';

const mockPageOptionsDto = {
    page: 1,
    take: 10,
    search: '',
} as PageOptionsDto;

const mockWatchListItems = [
    { id: '1', movie: { id: 'm1', title: 'Movie 1' }, created_at: new Date() },
    { id: '2', movie: { id: 'm2', title: 'Movie 2' }, created_at: new Date() },
] as WatchListItem[];

const mockPaginatedResponse = {
    items: mockWatchListItems,
    meta: {
        total: 2,
        itemsPerPage: 2,
        pageOptionsDto: mockPageOptionsDto,
    } as unknown as PageMetaDto,
};

describe('WatchListController', () => {
    let controller: WatchListController;
    let service: WatchListService;
  
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WatchListController],
            providers: [
                {
                    provide: WatchListService,
                    useValue: {
                        getWatchListItems: jest.fn(),
                        removeItemFromWishList: jest.fn(),
                    },
                },
            ],
        })
        .overrideGuard(AuthGuard)
        .useClass(MockAuthGuard)
        .compile();
    
        controller = module.get<WatchListController>(WatchListController);
        service = module.get<WatchListService>(WatchListService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getWatchListItems', () => {
        it('should return paginated watchlist items wrapped in SuccessClass', async () => {
            jest
                .spyOn(service, 'getWatchListItems')
                .mockResolvedValue(mockPaginatedResponse);

            const result = await controller.getWatchListItems(mockPageOptionsDto, mockUserId);

            expect(result).toBeInstanceOf(SuccessClass);
            expect(service.getWatchListItems).toHaveBeenCalledWith(mockPageOptionsDto, mockUserId);
            expect(result.data).toEqual(mockPaginatedResponse);
        });
    });
    
    describe('removeItemFromWishList', () => {
        it('should remove an item from the watchlist', async () => {
          const movieId = '123';

          jest
            .spyOn(service, 'removeItemFromWishList')
            .getMockImplementation();
    
          const result = await controller.removeFromWatchList(movieId, mockUserId);
    
          expect(result.message).toEqual('The watchlist item is removed successfully');
          expect(service.removeItemFromWishList).toHaveBeenCalledWith(movieId, mockUserId);
        });
    });
});
