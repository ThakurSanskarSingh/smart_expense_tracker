/**
 * @fileoverview Main Dashboard view displaying KPI metric cards, Chart.js visualizations,
 * recent expenses list, and smart insight highlights.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import Skeleton from '../components/common/Skeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
);

export default function Dashboard() {
  const { dbUser } = useAuth();
  const currency = dbUser?.currency || 'INR';

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [insights, setInsights] = useState([]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [sumRes, catRes, monthRes, recRes, budRes, insRes] = await Promise.all([
          apiClient.get('/analytics/summary', { params: { month: currentMonth } }),
          apiClient.get('/analytics/by-category', { params: { month: currentMonth } }),
          apiClient.get('/analytics/monthly'),
          apiClient.get('/expenses', { params: { limit: 5, sort: '-date' } }),
          apiClient.get('/budgets/status', { params: { month: currentMonth } }),
          apiClient.get('/insights', { params: { month: currentMonth } }),
        ]);

        setSummary(sumRes.data);
        setByCategory(catRes.data || []);
        setMonthlyTrends(monthRes.data || []);
        setRecentExpenses(recRes.data?.expenses || []);
        setBudgetStatus(budRes.data || []);
        setInsights(insRes.data?.tips || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [currentMonth]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="32px" width="220px" />
        <div className="grid-cols-4">
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
        <div className="grid-cols-2">
          <Skeleton height="320px" />
          <Skeleton height="320px" />
        </div>
      </div>
    );
  }

  // Calculate overall budget progress
  const overallBudget = budgetStatus.find((b) => !b.category);
  const totalBudgetLimit = overallBudget
    ? overallBudget.limit
    : budgetStatus.reduce((acc, b) => acc + b.limit, 0);
  const totalBudgetSpent = summary?.totalSpent || 0;
  const budgetPercentUsed =
    totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  // Doughnut Chart Data (by Category)
  const doughnutData = {
    labels: byCategory.map((c) => c.name),
    datasets: [
      {
        data: byCategory.map((c) => c.total),
        backgroundColor: byCategory.map(
          (c) => c.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
        ),
        borderWidth: 2,
        borderColor: 'var(--bg-surface)',
      },
    ],
  };

  // Monthly Bar Chart Data
  const barData = {
    labels: monthlyTrends.map((m) => {
      const parts = m.month.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Monthly Spending',
        data: monthlyTrends.map((m) => m.total),
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
    ],
  };

  // Daily Trend Line Chart Data
  // Build days in month
  const [yearStr, mStr] = currentMonth.split('-');
  const daysInCurrentMonth = new Date(parseInt(yearStr, 10), parseInt(mStr, 10), 0).getDate();
  const dailyLabels = Array.from({ length: daysInCurrentMonth }, (_, i) => String(i + 1));
  const dailyDataMap = new Array(daysInCurrentMonth).fill(0);

  // Distribute recent expenses if available
  recentExpenses.forEach((exp) => {
    const d = new Date(exp.date);
    if (d.getMonth() + 1 === parseInt(mStr, 10)) {
      dailyDataMap[d.getDate() - 1] += exp.amount;
    }
  });

  const lineData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Daily Outflow',
        data: dailyDataMap,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header with Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Dashboard Overview</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Financial health and tracking for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/expenses/new" className="btn btn-primary">
            + Add Expense
          </Link>
          <Link to="/budgets" className="btn btn-secondary">
            Set Budget
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid-cols-4">
        {/* KPI 1: Month Total */}
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.35rem' }}>
            TOTAL SPENT THIS MONTH
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(summary?.totalSpent || 0, currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {summary?.expenseCount || 0} transactions
          </div>
        </div>

        {/* KPI 2: vs Last Month */}
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.35rem' }}>
            VS PREVIOUS MONTH
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: summary?.changePercentage > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {summary?.changePercentage > 0 ? `+${summary.changePercentage}%` : `${summary?.changePercentage || 0}%`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Prev: {formatCurrency(summary?.previousMonthTotal || 0, currency)}
          </div>
        </div>

        {/* KPI 3: Top Category */}
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.35rem' }}>
            TOP EXPENSE CATEGORY
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {summary?.topCategory?.name || 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {summary?.topCategory ? `${formatCurrency(summary.topCategory.amount, currency)} (${summary.topCategory.percentage}%)` : 'No data recorded'}
          </div>
        </div>

        {/* KPI 4: Budget Used */}
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.35rem' }}>
            BUDGET UTILIZATION
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: budgetPercentUsed > 100 ? 'var(--danger)' : budgetPercentUsed > 80 ? 'var(--warning)' : 'var(--success)' }}>
            {budgetPercentUsed}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {totalBudgetLimit > 0 ? `Limit: ${formatCurrency(totalBudgetLimit, currency)}` : 'No budget set'}
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Doughnut & Monthly Bar */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Category Distribution</h2>
            <Link to="/analytics" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
              Full report →
            </Link>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {byCategory.length > 0 ? (
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
            ) : (
              <EmptyState icon="🥧" title="No category data" message="Add expenses to see category breakdown." />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">12-Month Outflow Trend</h2>
            <Link to="/analytics" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
              View Trends →
            </Link>
          </div>
          <div style={{ height: '260px' }}>
            <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Row: Daily Trend Line & AI Insights Preview */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Daily Spending Activity</h2>
          </div>
          <div style={{ height: '230px' }}>
            <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💡 Smart Insights</h2>
            <Link to="/insights" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
              All Tips →
            </Link>
          </div>
          {insights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.slice(0, 3).map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background:
                      tip.severity === 'danger'
                        ? 'var(--danger-bg)'
                        : tip.severity === 'warning'
                        ? 'var(--warning-bg)'
                        : 'var(--info-bg)',
                    borderLeft: `4px solid ${
                      tip.severity === 'danger'
                        ? 'var(--danger)'
                        : tip.severity === 'warning'
                        ? 'var(--warning)'
                        : 'var(--info)'
                    }`,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                    {tip.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {tip.message}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="💡" title="No insights yet" message="Keep adding expenses to unlock personalized recommendations." />
          )}
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Transactions</h2>
          <Link to="/expenses" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
            View all expenses →
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((exp) => (
                  <tr key={exp._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{formatDate(exp.date)}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{exp.description}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${exp.category?.color || '#3B82F6'}20`,
                          color: exp.category?.color || '#3B82F6',
                        }}
                      >
                        {exp.category?.name || 'Other'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      {exp.paymentMethod}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(exp.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="💳"
            title="No expenses logged yet"
            message="Add your first expense to begin tracking."
            action={
              <Link to="/expenses/new" className="btn btn-primary">
                + Add Expense
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
