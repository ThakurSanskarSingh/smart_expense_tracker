/**
 * @fileoverview Main entrypoint executing database connection and Express HTTP server.
 */

import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startRecurringCronJob } from './jobs/recurringJob.js';
import { logger } from './utils/logger.js';

let server;

async function bootstrap() {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Start recurring expense background scheduler
    if (config.nodeEnv !== 'test') {
      startRecurringCronJob();
      logger.info('[Scheduler] Recurring expenses cron job registered (00:05 daily).');
    }

    // 3. Listen on port
    server = app.listen(config.port, () => {
      logger.info(`[Server] Smart Expense Tracker running in ${config.nodeEnv} mode on port ${config.port}`);
      logger.info(`[Server] API Base: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function shutdown(signal) {
  logger.info(`[Server] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      logger.info('[Server] HTTP server closed.');
      await disconnectDB();
      logger.info('[MongoDB] Connection terminated.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

bootstrap();
