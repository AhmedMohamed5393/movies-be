import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenreService } from './genre.service';
import { Genre } from './entities/genre.entity';
import { GenreRepository } from './repositories/genre.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Genre]),
    LoggingModule,
  ],
  controllers: [],
  providers: [GenreService, GenreRepository],
  exports: [GenreService],
})
export class GenreModule {}
