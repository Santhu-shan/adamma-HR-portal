import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

export const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null, // Critical requirement for BullMQ workers
});

redisConnection.on('connect', () => {
  console.log(`Redis connected to ${redisHost}:${redisPort}`);
});

redisConnection.on('error', (err) => {
  console.error(`Redis connection error: ${err}`);
});
