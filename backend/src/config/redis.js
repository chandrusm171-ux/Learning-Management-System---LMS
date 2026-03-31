// Redis is optional for now — enable when REDIS_URL is set
let redisClient = null;

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('Redis skipped (no REDIS_URL set)');
    return null;
  }
  try {
    const { createClient } = await import('redis');
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
    console.log('Redis connected');
    return redisClient;
  } catch (err) {
    console.error('Redis connection failed:', err.message);
    return null;
  }
};

export default redisClient;