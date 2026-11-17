/**
 * @fileoverview Custom hook for budget limits and current monthly progress status.
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client.js';
import { useNotification } from '../context/NotificationContext.jsx';

export function useBudgets(initialMonth) {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(initialMonth || currentMonthStr);
  const { addToast } = useNotification();

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [budgetsRes, statusRes] = await Promise.all([
        apiClient.get('/budgets', { params: { month } }),
        apiClient.get('/budgets/status', { params: { month } }),
      ]);
      setBudgets(budgetsRes.data || []);
      setBudgetStatus(statusRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const saveBudget = async (data) => {
    try {
      await apiClient.post('/budgets', { ...data, month });
      addToast('Budget saved successfully', 'success');
      await loadBudgets();
    } catch (err) {
      addToast(err.message || 'Failed to save budget', 'error');
      throw err;
    }
  };

  const removeBudget = async (id) => {
    try {
      await apiClient.delete(`/budgets/${id}`);
      addToast('Budget deleted', 'success');
      await loadBudgets();
    } catch (err) {
      addToast(err.message || 'Failed to delete budget', 'error');
      throw err;
    }
  };

  return {
    budgets,
    budgetStatus,
    loading,
    error,
    month,
    setMonth,
    reload: loadBudgets,
    saveBudget,
    removeBudget,
  };
}
