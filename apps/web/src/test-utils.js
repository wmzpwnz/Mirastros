/**
 * Test utilities and helpers for frontend testing
 */
import { render } from '@testing-library/react';

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  fullName: 'Test User',
  subscriptionTier: 'freemium',
  ...overrides
});

export const createMockReading = (overrides = {}) => ({
  id: '1',
  readingType: 'tarot',
  question: 'What does my future hold?',
  cards: ['The Fool', 'The Magician', 'The High Priestess'],
  interpretation: 'This reading suggests positive changes ahead...',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockApiResponse = (data, success = true) => ({
  data: success ? data : null,
  error: success ? null : new Error('API Error'),
  loading: false
});

// Simple render function
export const renderWithProviders = (ui, options = {}) => {
  return render(ui, options);
};

// Test helpers
export const waitForElementToBeRemoved = async (element) => {
  // Simple implementation - in real tests, use proper waitFor
  return new Promise(resolve => setTimeout(resolve, 100));
};

// Mock API hooks
export const mockUseApi = (response) => {
  const mock = jest.fn();
  mock.mockReturnValue(response);
  return mock;
};

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
};

// Mock fetch
export const mockFetch = (responseData, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData)),
      headers: new Map()
    })
  );
};

// Test constants
export const TEST_USER = createMockUser();
export const TEST_READING = createMockReading();

// Utility functions
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const advanceTimersByTime = async (ms) => {
  jest.advanceTimersByTime(ms);
  await Promise.resolve(); // Wait for promises to resolve
};

// Mock GSAP
export const mockGSAP = () => {
  const mockGSAP = {
    registerPlugin: jest.fn(),
    set: jest.fn(),
    to: jest.fn(() => ({ kill: jest.fn() })),
    from: jest.fn(() => ({ kill: jest.fn() })),
    timeline: jest.fn(() => ({
      to: jest.fn(),
      from: jest.fn(),
      kill: jest.fn(),
      clear: jest.fn()
    })),
    utils: {
      toArray: jest.fn(() => [])
    }
  };

  global.gsap = mockGSAP;
  global.ScrollTrigger = { getAll: () => [], kill: jest.fn() };
};

// Mock matchMedia
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};