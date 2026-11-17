/**
 * @fileoverview Custom hook for fetching and mutating expense records.
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client.js';
import { useNotification } from '../context/NotificationContext.jsx';

export function useExpenses(initialFilters = {}) {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const { addToast, fetchNotifications } = useNotification();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/expenses', { params: filters });
      if (res?.data) {
        setExpenses(res.data.expenses);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      addToast(err.message || 'Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (data) => {
    try {
      const res = await apiClient.post('/expenses', data);
      addToast('Expense recorded successfully', 'success');
      await fetchExpenses();
      await fetchNotifications();
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to record expense', 'error');
      throw err;
    }
  };

  const updateExpense = async (id, data) => {
    try {
      const res = await apiClient.put(`/expenses/${id}`, data);
      addToast('Expense updated', 'success');
      await fetchExpenses();
      await fetchNotifications();
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to update expense', 'error');
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await apiClient.delete(`/expenses/${id}`);
      addToast('Expense removed', 'success');
      await fetchExpenses();
      await fetchNotifications();
    } catch (err) {
      addToast(err.message || 'Failed to delete expense', 'error');
      throw err;
    }
  };

  return {
    expenses,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
