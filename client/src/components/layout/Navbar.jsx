/**
 * @fileoverview Top navigation bar component displaying notifications, theme toggle, and profile.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

export default function Navbar() {
  const { dbUser, currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = dbUser?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  return (
    <header className="topbar">
      <div>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Group 41 · KIET Dept. of IT
        </span>
      </div>

      <div className="topbar-actions">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notifications Bell */}
        <Link
          to="/notifications"
          className="btn btn-secondary btn-icon"
          style={{ position: 'relative' }}
          title="Notifications"
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          🔔
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--danger)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }} className="desktop-only">
            {displayName}
          </span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
