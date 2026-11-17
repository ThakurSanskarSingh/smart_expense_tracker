/**
 * @fileoverview Data formatting utilities for currency, dates, and percentages.
 */

/**
 * Maps currency code to symbol.
 */
const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

/**
 * Formats a monetary number with appropriate symbol and commas.
 * @param {number} amount
 * @param {string} [currency='INR']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || `${currency} `;
  return `${symbol}${numeric.toLocaleString('en-IN', {
    minimumFractionDigits: numeric % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats an ISO date string or Date object into human-friendly string.
 * @param {string|Date} date
 * @param {object} [options]
 * @returns {string}
 */
export function formatDate(date, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', options);
}

/**
 * Formats YYYY-MM into a readable month and year (e.g. "November 2026").
 * @param {string} monthStr
 * @returns {string}
 */
export function formatMonthYear(monthStr) {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
