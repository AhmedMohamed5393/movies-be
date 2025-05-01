import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LoggingModule],
  controllers: [],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
