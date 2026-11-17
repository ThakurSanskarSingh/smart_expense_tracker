/**
 * @fileoverview Unit tests for ExpenseForm component validation and rendering.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ExpenseForm from '../pages/ExpenseForm.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

// Mock apiClient
vi.mock('../api/client.js', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/categories') {
        return Promise.resolve({
          data: [
            { _id: 'cat-1', name: 'Food', color: '#EF4444' },
            { _id: 'cat-2', name: 'Transport', color: '#F97316' },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: { _id: 'new-exp-1' } })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Mock firebase
vi.mock('../api/firebase.js', () => ({
  auth: { currentUser: { uid: 'test-user', getIdToken: () => Promise.resolve('test-token') } },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb({ uid: 'test-user', email: 'test@kiet.edu' });
    return () => {};
  }),
}));

describe('ExpenseForm Component', () => {
  it('renders all essential input fields and validates positive amount', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <ExpenseForm />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    // Verify fields exist
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();

    // Fill valid values
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Lunch' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toHaveValue(150);
    });
  });
});
