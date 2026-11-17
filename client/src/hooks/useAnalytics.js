/**
 * @fileoverview Custom hook for fetching analytics summaries, category distributions, and monthly trends.
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client.js';

export function useAnalytics(initialMonth, initialYear) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear().toString();

  const [month, setMonth] = useState(initialMonth || currentMonth);
  const [year, setYear] = useState(initialYear || currentYear);

  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [budgetVsActual, setBudgetVsActual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, monthRes, bvaRes] = await Promise.all([
        apiClient.get('/analytics/summary', { params: { month } }),
        apiClient.get('/analytics/by-category', { params: { month } }),
        apiClient.get('/analytics/monthly', { params: { year } }),
        apiClient.get('/analytics/budget-vs-actual', { params: { month } }),
      ]);

      setSummary(sumRes.data);
      setByCategory(catRes.data || []);
      setMonthlyTrends(monthRes.data || []);
      setBudgetVsActual(bvaRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    month,
    setMonth,
    year,
    setYear,
    summary,
    byCategory,
    monthlyTrends,
    budgetVsActual,
    loading,
    error,
    reload: loadData,
  };
}
