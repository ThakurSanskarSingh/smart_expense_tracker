/**
 * @fileoverview Centralized Axios client instance configured with Firebase ID token interceptor.
 */

import axios from 'axios';
import { auth } from './firebase.js';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: inject Firebase Bearer ID token into Authorization header
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const demoToken = localStorage.getItem('smart_expense_demo_token');
        if (demoToken) {
          config.headers.Authorization = `Bearer ${demoToken}`;
        }
      }
    } catch (err) {
      console.error('Failed to attach Firebase ID token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: unwrap response data or normalize errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to communicate with the server.',
    };
    return Promise.reject(errorPayload);
  },
);

export default apiClient;
