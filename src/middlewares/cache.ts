import { Request, Response, Protocol } from 'restana';
import { createClient, RedisClientType } from 'redis';
import { AppNext, AppRequest, AppResponse } from '../index.js';
import { CacheConfig } from '../config/config.loader.js';

export const createCache = (config: CacheConfig) => {

if (!config.enabled) return (req: AppRequest, res: AppResponse, next: AppNext) => next();

  const ttl = config.ttl ?? 60;
  let redis: RedisClientType | null = null;

  // Local fallback cache
  const memoryCache = new Map<string, { value: any; expires: number }>();

  if (config.type === 'redis' && config.redisUrl) {
    redis = createClient({ url: config.redisUrl });
    redis.connect().then(() => console.log('✅ Redis connected for caching'));
    redis.on('error', (err) => console.error('❌ Redis error:', err));
  }

  return async (req: AppRequest, res: AppResponse, next: AppNext) => {
    const key = `${req.method}:${req.url}`;

    // --- Try to read from cache ---
    if (redis) {
      const cached = await redis.get(key);
      if (cached) {
        res.send(JSON.parse(cached));
        return;
      }
    } else {
      const cached = memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        res.send(cached.value);
        return;
      }
    }

    // --- Hook into response ---
    const originalSend = res.send.bind(res);
    res.send = (body: any) => {

      // Cache response - intecept body
      const value = typeof body === 'string' ? body : JSON.stringify(body);

      if (redis) {
        redis.setEx(key, ttl, value);
      } else {
        memoryCache.set(key, { value: body, expires: Date.now() + ttl * 1000 });
      }

      return originalSend(body);
    };

    next();
  };
};
