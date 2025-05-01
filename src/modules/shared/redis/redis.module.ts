// src/redis/redis.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost', // or your Docker Redis hostname
      port: +process.env.REDIS_PORT,
      ttl: 60, // default TTL in seconds
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
