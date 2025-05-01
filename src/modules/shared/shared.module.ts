import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { dataSourceOptions } from '../../../db/database.config';
import { JWTAuthService } from './services/jwt-auth.service';
import { PasswordService } from './services/password.service';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRE_IN');
        return {
          secret: jwtSecret,
          signOptions: { expiresIn },
        };
      },
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  exports: [
    JWTAuthService,
    PasswordService,
  ],
  providers: [
    JWTAuthService,
    JwtService,
    PasswordService,
  ],
})
export class SharedModule {}
