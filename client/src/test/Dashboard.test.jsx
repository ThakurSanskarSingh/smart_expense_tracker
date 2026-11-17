/**
 * @fileoverview Unit tests for Dashboard layout, KPI cards, and chart rendering.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../pages/Dashboard.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';

// Mock Chart.js canvas elements
vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

// Mock API client
vi.mock('../api/client.js', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/analytics/summary') {
        return Promise.resolve({
          data: {
            totalSpent: 4500,
            expenseCount: 12,
            changePercentage: 5,
            previousMonthTotal: 4200,
            topCategory: { name: 'Food', amount: 2000, percentage: 44.4 },
          },
        });
      }
      if (url === '/analytics/by-category') {
        return Promise.resolve({
          data: [{ categoryId: 'c1', name: 'Food', total: 2000, percentage: 44.4 }],
        });
      }
      if (url === '/analytics/monthly') {
        return Promise.resolve({
          data: [{ month: '2026-11', total: 4500, count: 12 }],
        });
      }
      if (url === '/expenses') {
        return Promise.resolve({
          data: {
            expenses: [
              {
                _id: 'e1',
                amount: 250,
                description: 'Snacks',
                date: '2026-11-17',
                paymentMethod: 'upi',
                category: { name: 'Food', color: '#EF4444' },
              },
            ],
          },
        });
      }
      if (url === '/budgets/status') {
        return Promise.resolve({
          data: [{ budgetId: 'b1', limit: 10000, spent: 4500, percent: 45, state: 'ok' }],
        });
      }
      if (url === '/insights') {
        return Promise.resolve({
          data: {
            tips: [{ type: 'savings_tip', title: 'Great Progress', message: 'Budget on track', severity: 'info' }],
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
  },
}));

// Mock firebase
vi.mock('../api/firebase.js', () => ({
  auth: { currentUser: { uid: 'u1' } },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb({ uid: 'u1', email: 'test@kiet.edu' });
    return () => {};
  }),
}));

describe('Dashboard Component', () => {
  it('renders KPI summary cards and quick action links', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Dashboard />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument();
      expect(screen.getByText(/total spent this month/i)).toBeInTheDocument();
      expect(screen.getByText(/\+ add expense/i)).toBeInTheDocument();
    });
  });
});
