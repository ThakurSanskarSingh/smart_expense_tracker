/**
 * @fileoverview 404 Not Found error page.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '1.5rem' }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}
