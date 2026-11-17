/**
 * @fileoverview Toast alert display container component.
 */

import React from 'react';
import { useNotification } from '../../context/NotificationContext.jsx';

export default function Toast() {
  const { toasts, removeToast } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <span>{t.message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(t.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              marginLeft: '0.75rem',
              fontWeight: 'bold',
            }}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
