/**
 * @fileoverview MongoDB database connection module using Mongoose ODM.
 */

import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Connects to MongoDB database using Mongoose.
 * @param {string} [uri] - Optional custom connection string (used in testing).
 * @returns {Promise<typeof mongoose>} Mongoose connection instance.
 */
export async function connectDB(uri = config.mongodbUri) {
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Closes the active MongoDB connection.
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  await mongoose.disconnect();
}
