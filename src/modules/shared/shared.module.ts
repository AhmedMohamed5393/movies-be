import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { dataSourceOptions } from '../../../db/database.config';
import { JWTAuthService } from './services/jwt-auth.service';
import { PasswordService } from './services/password.service';
import { RedisService } from './services/redis.service';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST, // or your Docker Redis hostname
      port: +process.env.REDIS_PORT,
      ttl: 60, // default TTL in seconds
    }),
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
    RedisService,
  ],
  providers: [
    JWTAuthService,
    JwtService,
    PasswordService,
    RedisService,
  ],
})
export class SharedModule {}
