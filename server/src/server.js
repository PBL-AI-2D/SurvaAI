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

  if (!dbConnected || !redisClient || !emailTransporter) {
    console.error('❌ Server not started due to failed dependencies');
    process.exit(1);
  }

  initializeCronJobs();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
