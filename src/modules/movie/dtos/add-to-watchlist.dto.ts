import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddToWatchListDto {
  @ApiProperty({
    example: 'ID of the selected movie',
    description: 'The id of the movie',
  })
  @IsNotEmpty()
  @IsUUID()
  movie_id: string;
}
