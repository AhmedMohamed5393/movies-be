import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingService } from './rating.service';
import { RatingRepository } from './repositories/rating.repository';
import { Rating } from './entities/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating]), LoggingModule],
  controllers: [],
  providers: [RatingService, RatingRepository],
  exports: [RatingService],
})
export class RatingModule {}
