# Test Quick Start Guide

## Installation

### Backend Testing
```bash
cd apps/backend
pip install -r requirements-test.txt
```

### Frontend Testing
```bash
# Root dependencies
npm install

# Shared core
cd packages/shared-core
npm install vitest @testing-library/react @testing-library/jest-dom @vitest/ui --save-dev

# Design system
cd packages/design-system
npm install vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react --save-dev

# Web E2E
cd apps/web
npm install @playwright/test --save-dev
npx playwright install
```

## Running Tests

### Backend Unit Tests
```bash
cd apps/backend
pytest tests/test_llm_service.py -v
pytest tests/test_rag_service.py -v
pytest tests/test_auth.py -v
pytest tests/test_subscription.py -v
```

### Backend Integration Tests
```bash
cd apps/backend
pytest tests/test_api_endpoints.py -v
pytest tests/test_database_operations.py -v
pytest tests/test_redis_caching.py -v
```

### Frontend Unit Tests
```bash
cd packages/shared-core
npm test
# or
npm run test:watch
```

### Component Tests
```bash
cd packages/design-system
npm test
```

### E2E Tests
```bash
cd apps/web
npx playwright test
# or with UI
npx playwright test --ui
# or headed mode
npx playwright test --headed
```

## Run All Tests
```bash
# Backend
cd apps/backend && pytest tests/ -v

# Frontend
cd packages/shared-core && npm test
cd packages/design-system && npm test

# E2E
cd apps/web && npx playwright test
```

## Coverage Reports
```bash
# Backend coverage
cd apps/backend
pytest tests/ --cov --cov-report=html
open htmlcov/index.html

# Frontend coverage
cd packages/shared-core
npm test -- --coverage
```

## Watch Mode (Development)
```bash
# Frontend unit tests
cd packages/shared-core
npm run test:watch

# Component tests
cd packages/design-system
npm run test:watch
```

## Debugging Tests

### Backend
```bash
# Run specific test
pytest tests/test_auth.py::TestAuthentication::test_password_hashing -v

# Run with print statements
pytest tests/test_auth.py -v -s

# Run with debugger
pytest tests/test_auth.py --pdb
```

### Frontend
```bash
# Run specific test file
npm test -- src/utils/__tests__/index.test.ts

# Run with UI
npm test -- --ui

# Debug in browser
npm test -- --inspect
```

### E2E
```bash
# Run specific test
npx playwright test e2e/auth.spec.ts

# Debug mode
npx playwright test --debug

# Show report
npx playwright show-report
```

## Common Issues

### Backend
- **Import errors:** Ensure you're in the backend directory and virtual environment is activated
- **Database errors:** Tests use in-memory SQLite, no setup needed
- **Redis errors:** Tests use mocked Redis client

### Frontend
- **Module not found:** Run `npm install` in the package directory
- **React errors:** Ensure `@vitejs/plugin-react` is installed
- **Type errors:** Check `tsconfig.json` configuration

### E2E
- **Browser not found:** Run `npx playwright install`
- **Timeout errors:** Increase timeout in `playwright.config.ts`
- **Server not running:** Tests auto-start dev server, but check port 3000 is free

## Test Structure

```
mirastros-universal/
├── apps/backend/tests/          # Backend tests
│   ├── conftest.py              # Pytest fixtures
│   ├── test_llm_service.py      # LLM unit tests
│   ├── test_rag_service.py      # RAG unit tests
│   ├── test_auth.py             # Auth unit tests
│   ├── test_subscription.py     # Subscription unit tests
│   ├── test_api_endpoints.py    # API integration tests
│   ├── test_database_operations.py  # DB integration tests
│   └── test_redis_caching.py    # Redis integration tests
│
├── packages/shared-core/src/
│   ├── utils/__tests__/         # Utility tests
│   ├── api/__tests__/           # API client tests
│   └── validation/__tests__/    # Validation tests
│
├── packages/design-system/src/
│   └── components/__tests__/    # Component tests
│
└── apps/web/e2e/                # E2E tests
    ├── auth.spec.ts             # Auth flow tests
    ├── services.spec.ts         # Service tests
    ├── chat.spec.ts             # Chat tests
    └── subscription.spec.ts     # Subscription tests
```

## Quick Commands

```bash
# Run everything
npm run test:all  # (if configured in root package.json)

# Backend only
cd apps/backend && pytest tests/ -v

# Frontend only
cd packages/shared-core && npm test && cd ../design-system && npm test

# E2E only
cd apps/web && npx playwright test

# Watch mode (development)
cd packages/shared-core && npm run test:watch
```
