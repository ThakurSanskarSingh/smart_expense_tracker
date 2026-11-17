/**
 * @fileoverview Unit tests for AuthContext and authentication state hook.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';

// Mock firebase/auth
vi.mock('../api/firebase.js', () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return () => {};
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
}));

function ConsumerComponent() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading Auth...</div>;
  return <div>{currentUser ? `User: ${currentUser.email}` : 'No User Logged In'}</div>;
}

describe('AuthContext', () => {
  it('renders children and indicates unauthenticated state initially', () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    expect(screen.getByText('No User Logged In')).toBeInTheDocument();
  });
});
