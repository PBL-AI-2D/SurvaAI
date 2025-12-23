import 'dotenv/config';

import app from './app.js';
import { testDatabaseConnection } from './config/database.js';
import { testRedisConnection } from './config/redis.js';
import { testEmailConnection } from './config/email.js';
import { initializeCronJobs } from './jobs/index.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await testDatabaseConnection();
  const redisClient = await testRedisConnection();
  const emailTransporter = await testEmailConnection();

  // Database dan Email wajib, tapi Redis bisa opsional (dengan warning)
  if (!dbConnected || !emailTransporter) {
    console.error('❌ Server not started due to failed dependencies (DB or Email)');
    process.exit(1);
  }

  if (!redisClient) {
    console.warn('⚠️ Warning: Redis connection failed. Server will continue but refresh token features may not work properly.');
  }

  initializeCronJobs();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
