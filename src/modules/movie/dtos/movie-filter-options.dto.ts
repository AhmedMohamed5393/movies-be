import { PageOptionsDto } from "@shared/pagination/pageOption.dto";
import { IsOptional, IsString } from "class-validator";

export class MovieFilterOptionsDto extends PageOptionsDto {
    @IsOptional()
    @IsString()
    genre?: string;
}
