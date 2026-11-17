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
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('Could not connect')) {
      console.warn('[MongoDB] Action Required: Add your current IP (or 0.0.0.0/0) to MongoDB Atlas -> Network Access.');
    }
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(() => {
        console.log('[MongoDB] Retrying database connection in background...');
        connectDB(uri).catch(() => {});
      }, 10000);
    }
    return null;
  }
}

/**
 * Closes the active MongoDB connection.
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  await mongoose.disconnect();
}
