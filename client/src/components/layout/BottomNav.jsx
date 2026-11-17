/**
 * @fileoverview Mobile bottom navigation bar rendered for viewport widths under 768px.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

const MOBILE_NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '📊' },
  { path: '/expenses', label: 'Expenses', icon: '💳' },
  { path: '/budgets', label: 'Budgets', icon: '🎯' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      {MOBILE_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
