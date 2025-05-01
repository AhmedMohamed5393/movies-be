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

  @ApiProperty({
    example: 'ID of the user',
    description: 'The id of the user',
  })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
