/**
 * @fileoverview Expense transaction list with filter bar, responsive cards/table,
 * pagination, CSV export, and deletion confirmation modal.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useExpenses } from '../hooks/useExpenses.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import Modal from '../components/common/Modal.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function Expenses() {
  const { dbUser } = useAuth();
  const currency = dbUser?.currency || 'INR';
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form filter state
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortOption, setSortOption] = useState('-date');

  const {
    expenses,
    pagination,
    loading,
    filters,
    setFilters,
    deleteExpense,
  } = useExpenses({ sort: '-date', page: 1, limit: 10 });

  // Load category list for filter dropdown
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

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setFilters({
      ...filters,
      q: searchInput || undefined,
      category: categoryFilter || undefined,
      paymentMethod: paymentFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      sort: sortOption,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setCategoryFilter('');
    setPaymentFilter('');
    setFromDate('');
    setToDate('');
    setSortOption('-date');
    setFilters({ sort: '-date', page: 1, limit: 10 });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteExpense(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV export handler with current query parameters
  const handleExportCSV = async () => {
    try {
      const response = await apiClient.get('/expenses/export.csv', {
        params: filters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export CSV failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Expense Log</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Search, filter, manage, and export all recorded transactions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            📥 Export CSV
          </button>
          <Link to="/expenses/new" className="btn btn-primary">
            + Add Expense
          </Link>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="card">
        <form onSubmit={handleApplyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search description/notes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Category</label>
            <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Payment Method</label>
            <select className="form-control" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="netbanking">Net Banking</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Sort By</label>
            <select className="form-control" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="-date">Date (Newest first)</option>
              <option value="date">Date (Oldest first)</option>
              <option value="-amount">Amount (Highest first)</option>
              <option value="amount">Amount (Lowest first)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Filter
            </button>
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Expense List Display */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height="50px" />
          <Skeleton height="50px" />
          <Skeleton height="50px" />
          <Skeleton height="50px" />
        </div>
      ) : expenses.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.875rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Payment</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {formatDate(exp.date)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{exp.description}</div>
                      {exp.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.notes}</div>
                      )}
                      {exp.recurring?.enabled && (
                        <span className="badge badge-info" style={{ marginTop: '0.2rem', fontSize: '0.7rem' }}>
                          🔄 Recurring ({exp.recurring.frequency})
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
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
                    <td style={{ padding: '0.875rem 1rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      {exp.paymentMethod}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                      {formatCurrency(exp.amount, currency)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => navigate(`/expenses/${exp._id}/edit`)}
                          className="btn btn-secondary btn-icon"
                          title="Edit Expense"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteId(exp._id)}
                          className="btn btn-secondary btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Expense"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total items)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="💳"
          title="No expenses match your criteria"
          message="Try adjusting filters or record a new expense."
          action={
            <Link to="/expenses/new" className="btn btn-primary">
              + Add Expense
            </Link>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Confirm Expense Deletion"
      >
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to permanently delete this expense? This action cannot be undone and will recompute your budget balance.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={isDeleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Expense'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
