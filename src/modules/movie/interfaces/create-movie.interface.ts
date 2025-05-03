import { Genre } from "src/modules/genre/entities/genre.entity";

export interface CreateMovieInterface {
    tmdb_id: string;
    title: string;
    overview: string;
    poster_path?: string;
    release_date?: string;
    genres: Genre[];
}
