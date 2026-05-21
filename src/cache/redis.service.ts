import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('REDIS_HOST');
    if (!host) {
      this.logger.warn('REDIS_HOST not set — caching disabled, falling back to direct DB queries');
      return;
    }
    const port = this.config.get<number>('REDIS_PORT') ?? 6379;
    this.client = new Redis({ host, port, lazyConnect: true });
    this.client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
    this.logger.log(`RedisService connected to ${host}:${port}`);
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // cache write failure is non-fatal
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(...keys);
    } catch {
      // cache eviction failure is non-fatal
    }
  }
}
