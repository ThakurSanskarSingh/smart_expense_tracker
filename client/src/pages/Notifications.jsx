/**
 * @fileoverview Notifications inbox page with unread filter and mark-read controls.
 */

import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext.jsx';
import { formatDate } from '../utils/formatters.js';
import EmptyState from '../components/common/EmptyState.jsx';

export default function Notifications() {
  const { notifications, markAsRead, markAllRead, unreadCount } = useNotification();
  const [filterUnread, setFilterUnread] = useState(false);

  const displayed = filterUnread ? notifications.filter((n) => !n.read) : notifications;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return '🚨';
      case 'budget_warning':
        return '⚠️';
      case 'recurring_added':
        return '🔄';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Notifications</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            System alerts, budget threshold warnings, and recurring transaction updates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`btn ${filterUnread ? 'btn-primary' : 'btn-secondary'}`}
          >
            {filterUnread ? 'Show All' : `Unread Only (${unreadCount})`}
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-secondary">
              ✓ Mark All Read
            </button>
          )}
        </div>
      </div>

      {displayed.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayed.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                backgroundColor: n.read ? 'var(--bg-surface)' : 'var(--bg-surface-hover)',
                borderLeft: n.read ? '1px solid var(--border-color)' : '4px solid var(--primary)',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{getTypeIcon(n.type)}</span>
                <div>
                  <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(n.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n._id)}
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔔"
          title={filterUnread ? 'No unread notifications' : 'Inbox is empty'}
          message="You are completely caught up!"
        />
      )}
    </div>
  );
}
