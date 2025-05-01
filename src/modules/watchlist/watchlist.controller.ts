import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { WatchListService } from './watchlist.service';
import {
  findWatchListItemsResponse,
  removeFromWatchListItemResponse,
} from './constants/watchlist-examples.constant';
import { SuccessClass } from '@shared/classes/success.class';
import { AuthGuard } from '@shared/guards/auth.guard';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { AuthenticatedUser } from '@shared/decorators/authenticated-user.decorator';

@ApiTags('watchlist') // Group endpoints under 'watchlist' in Swagger UI
@ApiBearerAuth('access-token') // Add Bearer Auth to all endpoints
@UseInterceptors(ClassSerializerInterceptor)
@Controller('watchlist')
export class WatchListController {
  constructor(private readonly watchlistService: WatchListService) {}

  @ApiOperation({ summary: "Get all watchlist items" })
  @ApiResponse({
    status: 200,
    description: "List of watchlist items retrieved successfully",
    example: findWatchListItemsResponse,
  })
  @ApiQuery({ type: PageOptionsDto })
  @Get("/")
  async getWatchListItems(
    @Query() pageOptionsDto: PageOptionsDto,
    @AuthenticatedUser('id') user_id: string,
  ): Promise<SuccessClass> {
    const data = await this.watchlistService.getWatchListItems(pageOptionsDto, user_id);
    return new SuccessClass(data);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete a watchlist item by ID" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden resource" })
  @ApiResponse({
    status: 200,
    description: "Movie is removed from watchlist successfully",
    example: removeFromWatchListItemResponse,
  })
  @ApiParam({ name: "id", type: String, description: "Watch list item ID" })
  @Delete("/:id")
  async removeFromWatchList(
    @Param("id") id: string,
    @AuthenticatedUser('id') user_id: string,
  ): Promise<SuccessClass> {
    await this.watchlistService.removeItemFromWishList(id, user_id);
    return new SuccessClass({}, "The watchlist item is removed successfully");
  }
}
