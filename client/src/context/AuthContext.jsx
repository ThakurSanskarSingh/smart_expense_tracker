/**
 * @fileoverview Authentication context provider integrating Firebase Client Auth
 * and backend profile synchronization.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../api/firebase.js';
import apiClient from '../api/client.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronizes the authenticated Firebase user with MongoDB
  const syncWithBackend = async (firebaseUser, overrides = {}) => {
    try {
      const res = await apiClient.post('/auth/sync', {
        name: overrides.name || firebaseUser.displayName,
        currency: overrides.currency,
        theme: overrides.theme,
      });
      if (res?.data?.user) {
        setDbUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await syncWithBackend(user);
        setLoading(false);
      } else {
        const demoToken = localStorage.getItem('smart_expense_demo_token');
        if (demoToken) {
          const demoUser = {
            uid: 'demo-user-group41',
            email: 'demo@kiet.edu',
            displayName: 'Group 41 Demo User',
            getIdToken: async () => demoToken,
          };
          setCurrentUser(demoUser);
          await syncWithBackend(demoUser);
        } else {
          setCurrentUser(null);
          setDbUser(null);
        }
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithDemo = async () => {
    const demoToken = 'demo-token';
    localStorage.setItem('smart_expense_demo_token', demoToken);
    const demoUser = {
      uid: 'demo-user-group41',
      email: 'demo@kiet.edu',
      displayName: 'Group 41 Demo User',
      getIdToken: async () => demoToken,
    };
    setCurrentUser(demoUser);
    await syncWithBackend(demoUser);
    return demoUser;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await syncWithBackend(cred.user);
    return cred.user;
  };

  const signup = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    await syncWithBackend(cred.user, { name });
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await syncWithBackend(cred.user);
    return cred.user;
  };

  const logout = async () => {
    localStorage.removeItem('smart_expense_demo_token');
    try {
      await signOut(auth);
    } catch {
      // Ignored for demo user
    }
    setCurrentUser(null);
    setDbUser(null);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateDbProfile = async (updates) => {
    const res = await apiClient.put('/users/me', updates);
    if (res?.data) {
      setDbUser(res.data);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        dbUser,
        loading,
        login,
        signup,
        loginWithGoogle,
        loginWithDemo,
        logout,
        resetPassword,
        updateDbProfile,
        syncWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
