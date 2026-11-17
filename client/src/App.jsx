/**
 * @fileoverview Main Application router and context hierarchy configuration.
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Common & Layout
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import ExpenseForm from './pages/ExpenseForm.jsx';
import Categories from './pages/Categories.jsx';
import Budgets from './pages/Budgets.jsx';
import Analytics from './pages/Analytics.jsx';
import Insights from './pages/Insights.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot" element={<ForgotPassword />} />

              {/* Protected Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="expenses/new" element={<ExpenseForm />} />
                <Route path="expenses/:id/edit" element={<ExpenseForm />} />
                <Route path="categories" element={<Categories />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="insights" element={<Insights />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 404 Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
