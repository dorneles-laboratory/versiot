import '@testing-library/jest-dom';

// Polyfill ResizeObserver para JSDOM (necessário para Three.js Canvas e Recharts)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
