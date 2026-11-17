/**
 * @fileoverview Password reset recovery page.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: '', type: '' });

    try {
      setLoading(true);
      await resetPassword(email);
      setStatusMessage({
        text: 'A password reset link has been dispatched to your email address.',
        type: 'success',
      });
    } catch (err) {
      setStatusMessage({
        text: err.message || 'Unable to send password reset email.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Enter your email to receive recovery instructions
          </p>
        </div>

        {statusMessage.text && (
          <div
            style={{
              background: statusMessage.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: statusMessage.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">Email Address</label>
            <input
              id="reset-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.25rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
