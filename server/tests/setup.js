/**
 * @fileoverview Jest test environment setup with resilient in-memory database mock.
 */

import { installMongooseMock, clearMemoryStore } from './mockDb.js';

export async function setupTestDB() {
  installMongooseMock();
  clearMemoryStore();
}

export async function clearTestDB() {
  clearMemoryStore();
}

export async function teardownTestDB() {
  clearMemoryStore();
}
