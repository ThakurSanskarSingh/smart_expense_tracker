/**
 * @fileoverview Firebase Authentication verification middleware.
 * Verifies Bearer JWT ID tokens issued by Firebase Auth and populates `req.user`.
 */

import { getFirebaseAdmin } from '../config/firebase.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Express middleware to authenticate requests via Firebase ID token.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication token missing or malformed', 401, 'UNAUTHORIZED');
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  let decodedToken;
  try {
    const admin = getFirebaseAdmin();
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw new AppError(`Authentication failed: ${error.message}`, 401, 'INVALID_TOKEN');
  }

  // Look up user in database
  const user = await User.findOne({ uid: decodedToken.uid });

  // For /api/auth/sync, user might not yet exist in MongoDB
  const isSyncRoute = req.baseUrl === '/api/auth' && req.path === '/sync';

  if (!user && !isSyncRoute) {
    throw new AppError('User profile not synchronized. Please authenticate via /api/auth/sync.', 401, 'USER_NOT_SYNCED');
  }

  req.firebaseUser = decodedToken;
  req.user = user || {
    uid: decodedToken.uid,
    email: decodedToken.email,
    name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
  };

  next();
});
