/**
 * @fileoverview User Profile and Settings page allowing preference customizations
 * (Currency, Theme), data exports, and group credits.
 */

import React, { useState, useEffect } from 'react';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function Settings() {
  const { dbUser, currentUser, updateDbProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useNotification();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [preferredTheme, setPreferredTheme] = useState('dark');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || '');
      setCurrency(dbUser.currency || 'INR');
      setPreferredTheme(dbUser.theme || theme || 'dark');
    }
  }, [dbUser, theme]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateDbProfile({ name, currency, theme: preferredTheme });
      setTheme(preferredTheme);
      addToast('Profile preferences updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportAllCSV = async () => {
    try {
      const response = await apiClient.get('/expenses/export.csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all-expenses-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Expense export downloaded', 'success');
    } catch (err) {
      addToast('Failed to export CSV data', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Settings & Preferences</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage your personal profile, preferred currency, and appearance
        </p>
      </div>

      {/* Preferences Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Profile Configuration</h2>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label" htmlFor="settings-email">Email Address</label>
            <input
              id="settings-email"
              type="text"
              className="form-control"
              value={currentUser?.email || ''}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settings-name">Full Name</label>
            <input
              id="settings-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-currency">Preferred Currency</label>
              <select
                id="settings-currency"
                className="form-control"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-theme">Theme Mode</label>
              <select
                id="settings-theme"
                className="form-control"
                value={preferredTheme}
                onChange={(e) => setPreferredTheme(e.target.value)}
              >
                <option value="dark">Dark Theme (Default)</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Management Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Data Export</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Download a complete CSV backup of all your recorded transactions, tags, notes, and payment methods.
        </p>
        <button onClick={handleExportAllCSV} className="btn btn-secondary">
          📥 Export Complete Expense Ledger (CSV)
        </button>
      </div>

      {/* Academic Credits */}
      <div className="card" style={{ background: 'var(--bg-surface-hover)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Academic Project Information
        </h3>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>Project:</strong> Smart Expense Tracker<br />
          <strong>Team:</strong> Group No. 41<br />
          <strong>Institution:</strong> Department of Information Technology, KIET Group of Institutions<br />
          <strong>University:</strong> Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow
        </p>
      </div>
    </div>
  );
}
