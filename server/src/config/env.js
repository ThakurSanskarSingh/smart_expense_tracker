/**
 * @fileoverview Environment configuration loader and validator.
 * Provides typed access to required application environment variables.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Validated application configuration object.
 */
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-expense-tracker',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'smart-expense-tracker-group41',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'none', // 'none' | 'gemini' | 'openai'
    apiKey: process.env.AI_API_KEY || '',
  },
};
