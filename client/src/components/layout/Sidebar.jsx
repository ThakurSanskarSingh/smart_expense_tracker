/**
 * @fileoverview Main desktop navigation sidebar.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/expenses', label: 'Expenses', icon: '💳' },
  { path: '/budgets', label: 'Budgets', icon: '🎯' },
  { path: '/categories', label: 'Categories', icon: '🏷️' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/insights', label: 'Smart Insights', icon: '💡' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>💰 ExpenseTracker</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Smart Expense Tracker v1.0
        </span>
      </div>
    </aside>
  );
}
