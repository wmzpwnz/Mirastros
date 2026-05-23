/**
 * Test utilities and helpers for frontend testing
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';

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

// Custom render functions
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    mocks = [],
    authState = null,
    ...renderOptions
  }: { mocks?: any[]; authState?: any; [key: string]: any } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(
      MockedProvider,
      { mocks },
      React.createElement(
        BrowserRouter,
        null,
        React.createElement(
          AuthProvider,
          { initialState: authState },
          children
        )
      )
    )
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Test helpers
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  return waitFor(() => expect(element).not.toBeInTheDocument());
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
};

// Mock API hooks
export const mockUseApi = (response: any) => {
  const mock = jest.fn();
  mock.mockReturnValue(response);
  return mock;
};

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
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
export const mockFetch = (responseData: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData)),
      headers: new Map()
    } as Response)
  ) as jest.Mock;
};

// Test constants
export const TEST_USER = createMockUser();
export const TEST_READING = createMockReading();

// Utility functions
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const advanceTimersByTime = async (ms: number) => {
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

  global.gsap = mockGSAP as any;
  global.ScrollTrigger = { getAll: () => [], kill: jest.fn() } as any;
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