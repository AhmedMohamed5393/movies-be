import { PageOptionsDto } from "@shared/pagination/pageOption.dto";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class MovieFilterOptionsDto extends PageOptionsDto {
    @IsOptional()
    @IsString()
    genre_name?: string;

    @IsOptional()
    @IsUUID()
    genre_id?: string;
}
