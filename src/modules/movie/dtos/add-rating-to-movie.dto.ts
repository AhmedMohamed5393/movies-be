import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class AddRatingToMovieDto {
  @ApiProperty({
    example: '  Rating of the movie',
    description: 'The rating of the movie',
  })
  @IsNumber()
  @Min(0.5)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'ID of the selected movie',
    description: 'The id of the movie',
  })
  @IsNotEmpty()
  @IsUUID()
  movie_id: string;
}
