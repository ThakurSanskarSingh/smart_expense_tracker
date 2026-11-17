/**
 * @fileoverview Firebase Client SDK initialization for frontend authentication.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForDevelopment12345678',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smart-expense-tracker-group41.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smart-expense-tracker-group41',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
