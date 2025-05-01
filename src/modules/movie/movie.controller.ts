import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SuccessClass } from "@shared/classes/success.class";
import { MovieService } from "./movie.service";
import { AuthenticatedUser } from "@shared/decorators/index.decorator";
import { AuthGuard } from "@shared/guards/index.guard";
import {
  findMovieDetailsResponse,
  findMoviesListResponse,
} from "./constants/movies-examples.constant";
import { addToWatchListResponse } from "../watchlist/constants/watchlist-examples.constant";
import {
  AddRatingToMovieDto,
  AddToWatchListDto,
  MovieFilterOptionsDto,
} from "./dtos/index.dto";
import { rateMovieResponse } from "../rating/constants/rating-examples.constant";

@ApiTags("movies") // Group endpoints under "movies" in Swagger UI
@ApiBearerAuth("access-token") // Add Bearer Auth to all endpoints
@UseInterceptors(ClassSerializerInterceptor)
@Controller("movies")
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @ApiOperation({ summary: "Get all movies" })
  @ApiResponse({
    status: 200,
    description: "List of movies retrieved successfully",
    example: findMoviesListResponse,
  })
  @ApiQuery({ type: MovieFilterOptionsDto })
  @Get("/")
  async getMovies(@Query() movieFilterOptionsDto: MovieFilterOptionsDto): Promise<SuccessClass> {
    const movies = await this.movieService.getMovies(movieFilterOptionsDto);
    return new SuccessClass(movies);
  }

  @ApiOperation({ summary: "Get a movie by ID" })
  @ApiResponse({
    status: 200,
    description: "Movie retrieved successfully",
    example: findMovieDetailsResponse,
  })
  @ApiParam({ name: "id", type: String, description: "Movie ID" })
  @Get("/:id")
  async getMovieById(@Param("id") id: string): Promise<SuccessClass> {
    const movie = await this.movieService.getMovieById(id);
    return new SuccessClass(movie);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Add a movie to watchlist" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden resource" })
  @ApiResponse({
    status: 201,
    description: "Movie is added to user's watchlist successfully",
    example: addToWatchListResponse,
  })
  @ApiBody({ type: AddToWatchListDto })
  @Post("/:id/watchlist")
  async addMovieToWatchList(
    @Body() addToWatchListDto: AddToWatchListDto,
    @AuthenticatedUser("id") user_id: string,
  ): Promise<SuccessClass> {
    const data = await this.movieService.addMovieItemToWatchList(
      addToWatchListDto,
      user_id,
    );
    return new SuccessClass(data, "movie is added to user's watchlist successfully");
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Rate a movie" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden resource" })
  @ApiResponse({
    status: 201,
    description: "Movie is rated by user successfully",
    example: rateMovieResponse,
  })
  @ApiBody({ type: AddRatingToMovieDto })
  @Post("/:id/rating")
  async addRatingToMovie(
    @Body() addRatingToMovieDto: AddRatingToMovieDto,
    @AuthenticatedUser("id") user_id: string,
  ): Promise<SuccessClass> {
    const data = await this.movieService.addRatingToMovie(
      addRatingToMovieDto,
      user_id,
    );
    return new SuccessClass(data, "movie is rated by user successfully");
  }
}
