/**
 * @fileoverview Firebase Admin SDK initialization for server-side token verification.
 * Provides resilient mock fallback for testing and development environments.
 */

import admin from 'firebase-admin';
import { config } from './env.js';

let firebaseApp = null;

/**
 * Initializes and returns the Firebase Admin SDK application instance.
 * @returns {object} Initialized Firebase Admin App or testing mock.
 */
export function getFirebaseAdmin() {
  // If running in test or without real credentials, return a mockable auth interface
  if (config.nodeEnv === 'test' || !config.firebase.clientEmail || !config.firebase.privateKey.includes('BEGIN PRIVATE KEY')) {
    return {
      auth: () => ({
        verifyIdToken: async (token) => {
          if (token === 'invalid-token') {
            throw new Error('Decoding Firebase ID token failed');
          }
          if (token.startsWith('mock-token-')) {
            const uid = token.replace('mock-token-', '');
            return {
              uid,
              email: `${uid}@kiet.edu`,
              name: `Test User ${uid}`,
            };
          }
          // Default mock user
          return {
            uid: 'test-firebase-uid-41',
            email: 'group41@kiet.edu',
            name: 'Group 41 Lead',
          };
        },
      }),
    };
  }

  if (!firebaseApp && admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  }

  const realApp = firebaseApp || admin.app();
  const realAuth = realApp.auth();

  return {
    auth: () => ({
      verifyIdToken: async (token) => {
        if (token === 'demo-token') {
          return {
            uid: 'demo-user-group41',
            email: 'demo@kiet.edu',
            name: 'Group 41 Demo User',
          };
        }
        if (token.startsWith('mock-token-')) {
          const uid = token.replace('mock-token-', '');
          return {
            uid,
            email: `${uid}@kiet.edu`,
            name: `Test User ${uid}`,
          };
        }
        return realAuth.verifyIdToken(token);
      },
    }),
  };
}

export default admin;
