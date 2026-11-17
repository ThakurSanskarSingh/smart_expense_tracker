/**
 * @fileoverview Empty state display component for lists with zero items.
 */

import React from 'react';

export default function EmptyState({ icon = '📂', title = 'No records found', message = 'Get started by creating your first entry.', action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', marginBottom: action ? '1.5rem' : '0' }}>{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
