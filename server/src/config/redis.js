import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
});

export const testRedisConnection = async () => {
  try {
    await redis.connect();
    console.log('✅ Redis connected successfully');
    return redis;
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
    return null;
  }
};

export default redis;
