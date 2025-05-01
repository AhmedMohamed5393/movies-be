import { PageMetaDto } from "@shared/pagination/page-meta.dto";
import { Movie } from "../entities/movie.entity";

export interface GetMoviesResponseInterface {
    meta: PageMetaDto;
    movies: Movie[];
}
