/**
 * @fileoverview Budget management page with month selector, color-coded threshold progress bars,
 * and category-level spending limits.
 */

import React, { useState, useEffect } from 'react';
import apiClient from '../api/client.js';
import { useBudgets } from '../hooks/useBudgets.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatMonthYear } from '../utils/formatters.js';
import Modal from '../components/common/Modal.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function Budgets() {
  const { dbUser } = useAuth();
  const currency = dbUser?.currency || 'INR';

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const {
    budgetStatus,
    loading,
    month,
    setMonth,
    saveBudget,
    removeBudget,
  } = useBudgets(currentMonthStr);

  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(''); // '' or 'overall'
  const [limit, setLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [submitting, setSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiClient.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  const openSetBudgetModal = () => {
    setCategoryId('');
    setLimit('');
    setAlertThreshold('80');
    setModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limit || parseFloat(limit) <= 0) return;

    try {
      setSubmitting(true);
      await saveBudget({
        categoryId: categoryId === 'overall' || !categoryId ? null : categoryId,
        limit: parseFloat(limit),
        alertThreshold: parseInt(alertThreshold, 10),
      });
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Overall totals
  const totalBudget = budgetStatus.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgetStatus.reduce((acc, b) => acc + b.spent, 0);
  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Budgets & Spending Limits</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Track active limits for {formatMonthYear(month)}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="month"
            className="form-control"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: '160px' }}
          />
          <button onClick={openSetBudgetModal} className="btn btn-primary">
            + Set Budget
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid-cols-3">
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.35rem' }}>
            TOTAL BUDGET ALLOCATION
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {formatCurrency(totalBudget, currency)}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.35rem' }}>
            TOTAL SPENT TO DATE
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalSpent > totalBudget && totalBudget > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {formatCurrency(totalSpent, currency)}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.35rem' }}>
            AGGREGATE UTILIZATION
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: overallPercent > 100 ? 'var(--danger)' : overallPercent > 80 ? 'var(--warning)' : 'var(--success)' }}>
            {overallPercent}%
          </div>
        </div>
      </div>

      {/* Budgets List with Progress Bars */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
      ) : budgetStatus.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {budgetStatus.map((b) => {
            const catName = b.category ? b.category.name : 'Overall Monthly Budget';
            const catColor = b.category?.color || '#3B82F6';
            const isExceeded = b.percent >= 100;
            const isWarning = b.percent >= b.alertThreshold && !isExceeded;

            const barColor = isExceeded ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)';
            const stateBadge = isExceeded ? (
              <span className="badge badge-danger">Exceeded</span>
            ) : isWarning ? (
              <span className="badge badge-warning">Warning ({b.percent}%)</span>
            ) : (
              <span className="badge badge-success">On Track</span>
            );

            return (
              <div key={b.budgetId} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: catColor,
                      }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{catName}</span>
                    {stateBadge}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong>{formatCurrency(b.spent, currency)}</strong> of {formatCurrency(b.limit, currency)}
                    </span>
                    <button
                      onClick={() => removeBudget(b.budgetId)}
                      className="btn btn-secondary btn-icon"
                      style={{ color: 'var(--danger)' }}
                      title="Remove Budget"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div
                  style={{
                    height: '10px',
                    background: 'var(--bg-surface-hover)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, b.percent)}%`,
                      backgroundColor: barColor,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Alert threshold: {b.alertThreshold}%</span>
                  <span>{isExceeded ? `Over by ${formatCurrency(b.spent - b.limit, currency)}` : `Remaining: ${formatCurrency(b.remaining, currency)}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🎯"
          title={`No budgets set for ${formatMonthYear(month)}`}
          message="Set spending goals to avoid overspending and receive proactive alerts."
          action={
            <button onClick={openSetBudgetModal} className="btn btn-primary">
              + Set Budget
            </button>
          }
        />
      )}

      {/* Set / Update Budget Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Spending Budget">
        <form onSubmit={handleSaveBudget}>
          <div className="form-group">
            <label className="form-label">Scope</label>
            <select
              className="form-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="overall">🌐 Overall Monthly Cap (All Categories)</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  🏷️ {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Spending Limit ({currency}) *</label>
            <input
              type="number"
              step="1"
              min="1"
              className="form-control"
              placeholder="e.g. 10000"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alert Warning Threshold: {alertThreshold}%</label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>50%</span>
              <span>80% (Recommended)</span>
              <span>95%</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
