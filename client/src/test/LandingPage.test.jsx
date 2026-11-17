import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';

// Mock AuthContext
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    currentUser: null,
    loginWithDemo: vi.fn(),
  }),
}));

describe('LandingPage Component', () => {
  it('renders all 9 sections in accordance with designprompts brief', () => {
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // 1. Site Header
    expect(screen.getAllByText('Smart expense tracker').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();

    // 2. Hero Section
    expect(screen.getByRole('heading', { level: 1, name: /financial clarity/i })).toBeInTheDocument();
    expect(screen.getAllByText(/git clone https:\/\/github\.com/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/12-Month Spending Trajectory/i)).toBeInTheDocument();

    // 3. Comparison Section
    expect(screen.getByRole('heading', { level: 2, name: /engineered against manual tracking/i })).toBeInTheDocument();
    expect(screen.getByText(/RECOMMENDED FOR VIVA & PRODUCTION/i)).toBeInTheDocument();

    // 4. Logo Cloud / Architecture
    expect(screen.getByRole('heading', { level: 2, name: /industry-grade ecosystem/i })).toBeInTheDocument();
    expect(screen.getByText('Node.js 20')).toBeInTheDocument();
    expect(screen.getByText('MongoDB Atlas')).toBeInTheDocument();

    // 5. Features
    expect(screen.getByRole('heading', { level: 2, name: /architected for proactive discipline/i })).toBeInTheDocument();
    expect(screen.getByText(/Real-Time Spending Caps & Alerts/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Recurring Expense Automation/i).length).toBeGreaterThanOrEqual(1);

    // 6. Download / Installation
    expect(screen.getByRole('heading', { level: 2, name: /install and run in minutes/i })).toBeInTheDocument();
    expect(screen.getByText(/Production Web SPA/i)).toBeInTheDocument();

    // 7. Blog Index / Technical Journal
    expect(screen.getByRole('heading', { level: 2, name: /technical journal & notes/i })).toBeInTheDocument();
    expect(screen.getByText(/Architecting a Dual-Engine Financial Anomaly Detector in Node 20/i)).toBeInTheDocument();

    // 8. Closing Section
    expect(screen.getByRole('heading', { level: 2, name: /take command of your financial trajectory today/i })).toBeInTheDocument();

    // 9. Footer
    expect(screen.getByText(/Final Year Capstone Project · Group No\. 41/i)).toBeInTheDocument();
    expect(screen.getByText(/© 2026 Smart Expense Tracker \(Group 41\)/i)).toBeInTheDocument();
  });
});
