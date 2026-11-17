/**
 * @fileoverview Vitest test setup file configuring DOM matchers and mocks.
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for theme detection and responsive hooks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
