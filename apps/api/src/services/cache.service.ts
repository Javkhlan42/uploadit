import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL = 30 * 60; // 30 minutes in seconds

// Create Redis client
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!redisClient) {
    try {
      redisClient = new Redis(REDIS_URL, {
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('Redis connection failed, operating without cache');
            return null;
          }
          return Math.min(times * 100, 3000);
        }
      });
      
      redisClient.on('error', (err) => {
        console.error('Redis error:', err);
      });
      
      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
      });
    } catch (error) {
      console.warn('Redis not available, operating without cache');
      return null;
    }
  }
  return redisClient;
}

/**
 * Get cached AI response
 */
export async function getCachedResponse(key: string): Promise<any | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }
  return null;
}

/**
 * Cache AI response
 */
export async function cacheResponse(key: string, data: any): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.setex(key, CACHE_TTL, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Clear cache by pattern
 */
export async function clearCache(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      return await client.del(...keys);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
  return 0;
}
