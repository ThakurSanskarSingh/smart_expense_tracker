/**
 * @fileoverview Comprehensive financial analytics dashboard featuring monthly/yearly trends,
 * category distribution, and grouped budget-vs-actual comparison charts.
 */

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatMonthYear } from '../utils/formatters.js';
import Skeleton from '../components/common/Skeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Analytics() {
  const { dbUser } = useAuth();
  const currency = dbUser?.currency || 'INR';

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear().toString();

  const {
    month,
    setMonth,
    year,
    setYear,
    byCategory,
    monthlyTrends,
    budgetVsActual,
    loading,
  } = useAnalytics(currentMonth, currentYear);

  // Grouped Budget vs Actual Bar Chart Data
  const budgetVsActualData = {
    labels: budgetVsActual.map((b) => b.categoryName),
    datasets: [
      {
        label: 'Budget Limit',
        data: budgetVsActual.map((b) => b.budget),
        backgroundColor: '#94A3B8',
        borderRadius: 4,
      },
      {
        label: 'Actual Spent',
        data: budgetVsActual.map((b) => b.actual),
        backgroundColor: budgetVsActual.map((b) => (b.isOver ? '#EF4444' : '#3B82F6')),
        borderRadius: 4,
      },
    ],
  };

  // 12-Month Trends Chart Data
  const monthlyTrendsData = {
    labels: monthlyTrends.map((m) => {
      const parts = m.month.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: `Monthly Outflow (${year})`,
        data: monthlyTrends.map((m) => m.total),
        backgroundColor: '#6366F1',
        borderRadius: 6,
      },
    ],
  };

  // Category Doughnut Data
  const doughnutData = {
    labels: byCategory.map((c) => c.name),
    datasets: [
      {
        data: byCategory.map((c) => c.total),
        backgroundColor: byCategory.map((c) => c.color || '#3B82F6'),
        borderWidth: 2,
        borderColor: 'var(--bg-surface)',
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header with Pickers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Analytics & Trends</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Deep-dive financial breakdown and historical comparisons
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Month
            </label>
            <input
              type="month"
              className="form-control"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: '150px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Year
            </label>
            <input
              type="number"
              min="2020"
              max="2035"
              className="form-control"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: '100px' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height="350px" />
          <div className="grid-cols-2">
            <Skeleton height="300px" />
            <Skeleton height="300px" />
          </div>
        </div>
      ) : (
        <>
          {/* Grouped Budget vs Actual Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Budget vs. Actual Spending ({formatMonthYear(month)})</h2>
            </div>
            <div style={{ height: '320px' }}>
              {budgetVsActual.length > 0 ? (
                <Bar
                  data={budgetVsActualData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (val) => formatCurrency(val, currency),
                        },
                      },
                    },
                  }}
                />
              ) : (
                <EmptyState
                  icon="🎯"
                  title="No active budgets found"
                  message="Define budgets in the Budgets section to see budget vs. actual comparisons."
                />
              )}
            </div>
          </div>

          {/* Row: Annual Monthly Trends & Category Share */}
          <div className="grid-cols-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Yearly Trajectory ({year})</h2>
              </div>
              <div style={{ height: '280px' }}>
                <Bar
                  data={monthlyTrendsData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (val) => formatCurrency(val, currency),
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Category Breakdown ({formatMonthYear(month)})</h2>
              </div>
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {byCategory.length > 0 ? (
                  <Doughnut
                    data={doughnutData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'right' } },
                    }}
                  />
                ) : (
                  <EmptyState icon="🥧" title="No expense data" message="No expenses recorded for this month." />
                )}
              </div>
            </div>
          </div>

          {/* Detailed Budget vs Actual Summary Table */}
          {budgetVsActual.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Detailed Variance Analysis</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Budget</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actual Spent</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Variance</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetVsActual.map((item) => (
                      <tr key={item.budgetId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.categoryName}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          {formatCurrency(item.budget, currency)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(item.actual, currency)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: item.isOver ? 'var(--danger)' : 'var(--success)' }}>
                          {item.difference < 0 ? `-${formatCurrency(Math.abs(item.difference), currency)}` : `+${formatCurrency(item.difference, currency)}`}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {item.isOver ? (
                            <span className="badge badge-danger">Over Budget ({item.percentUsed}%)</span>
                          ) : item.percentUsed >= 80 ? (
                            <span className="badge badge-warning">Near Limit ({item.percentUsed}%)</span>
                          ) : (
                            <span className="badge badge-success">Safe ({item.percentUsed}%)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
