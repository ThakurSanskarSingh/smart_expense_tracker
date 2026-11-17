/**
 * @fileoverview Form component for creating or editing expense transactions,
 * including category selection and recurring schedule options.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useNotification } from '../context/NotificationContext.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

export default function ExpenseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form State
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [nextDue, setNextDue] = useState('');

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiClient.get('/categories');
        setCategories(res.data || []);
        if (!isEdit && res.data?.length > 0) {
          setCategoryId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, [isEdit]);

  // Load existing expense if in edit mode
  useEffect(() => {
    if (isEdit) {
      async function loadExpense() {
        try {
          const res = await apiClient.get(`/expenses/${id}`);
          const exp = res.data;
          setAmount(exp.amount.toString());
          setCategoryId(exp.category?._id || exp.category || '');
          setDescription(exp.description);
          setDate(new Date(exp.date).toISOString().split('T')[0]);
          setPaymentMethod(exp.paymentMethod || 'upi');
          setNotes(exp.notes || '');
          if (exp.recurring?.enabled) {
            setIsRecurring(true);
            setFrequency(exp.recurring.frequency || 'monthly');
            setNextDue(exp.recurring.nextDue ? new Date(exp.recurring.nextDue).toISOString().split('T')[0] : '');
          }
        } catch (err) {
          addToast('Failed to load expense for editing', 'error');
          navigate('/expenses');
        } finally {
          setLoading(false);
        }
      }
      loadExpense();
    }
  }, [id, isEdit, navigate, addToast]);

  const validate = () => {
    const errs = {};
    if (!amount || parseFloat(amount) <= 0) {
      errs.amount = 'Amount must be greater than zero.';
    }
    if (!categoryId) {
      errs.categoryId = 'Please select a category.';
    }
    if (!description.trim()) {
      errs.description = 'Description is required.';
    }
    if (!date) {
      errs.date = 'Date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      amount: parseFloat(amount),
      categoryId,
      description: description.trim(),
      date,
      paymentMethod,
      notes: notes.trim(),
      recurring: {
        enabled: isRecurring,
        frequency: isRecurring ? frequency : 'monthly',
        nextDue: isRecurring && nextDue ? nextDue : null,
      },
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await apiClient.put(`/expenses/${id}`, payload);
        addToast('Expense updated successfully', 'success');
      } else {
        await apiClient.post('/expenses', payload);
        addToast('Expense created successfully', 'success');
      }
      navigate('/expenses');
    } catch (err) {
      addToast(err.message || 'Error saving expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton height="36px" width="200px" />
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/expenses" className="btn btn-secondary btn-icon" title="Back to Expenses">
          ←
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {isEdit ? 'Edit Transaction' : 'Record New Expense'}
        </h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-amount">Amount *</label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {errors.amount && <div className="form-error">{errors.amount}</div>}
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-desc">Description *</label>
            <input
              id="expense-desc"
              type="text"
              className="form-control"
              placeholder="e.g. Groceries at supermarket"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-cat">Category *</label>
            <select
              id="expense-cat"
              className="form-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
          </div>

          {/* Date & Payment Method side-by-side */}
          <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" htmlFor="expense-date">Date *</label>
              <input
                id="expense-date"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>

            <div>
              <label className="form-label" htmlFor="expense-payment">Payment Method</label>
              <select
                id="expense-payment"
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="upi">UPI</option>
                <option value="card">Debit / Credit Card</option>
                <option value="cash">Cash</option>
                <option value="netbanking">Net Banking</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-notes">Notes (Optional)</label>
            <textarea
              id="expense-notes"
              rows="3"
              className="form-control"
              placeholder="Add additional details, bill numbers, or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Recurring Schedule Switch */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked && !nextDue) {
                    // Default next due to 1 month from date
                    const next = new Date(date);
                    next.setMonth(next.getMonth() + 1);
                    setNextDue(next.toISOString().split('T')[0]);
                  }
                }}
              />
              <span>Schedule as Recurring Expense</span>
            </label>

            {isRecurring && (
              <div className="grid-cols-2" style={{ marginTop: '1rem' }}>
                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-control"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">First Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={nextDue}
                    onChange={(e) => setNextDue(e.target.value)}
                    required={isRecurring}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Link to="/expenses" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Expense' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
