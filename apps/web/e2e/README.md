# E2E Tests

End-to-end tests for Mirastros Universal web application using Playwright.

## Running Tests

```bash
# Install dependencies
npm install @playwright/test

# Install browsers
npx playwright install

# Run all tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Generate test report
npx playwright show-report
```

## Test Structure

- `auth.spec.ts` - Authentication flow tests (login, register, validation)
- `services.spec.ts` - Service page tests (tarot, horoscope, natal chart)
- `chat.spec.ts` - AI chat functionality tests (clarify button, streaming)
- `subscription.spec.ts` - Subscription and payment flow tests

## Test Coverage

### Critical User Flows
- ✅ User registration
- ✅ User login
- ✅ Service navigation
- ⏭️ Tarot reading (requires auth)
- ⏭️ Horoscope viewing (requires auth)
- ⏭️ Natal chart calculation (requires auth)
- ⏭️ AI chat interaction (requires premium)
- ⏭️ Subscription upgrade (requires payment setup)
- ⏭️ Payment processing (requires payment gateway)

### Notes
- Some tests are skipped (`.skip()`) because they require:
  - User authentication
  - Premium subscription
  - Payment gateway integration
  - Backend API running
- These tests can be enabled once the full system is deployed

## Configuration

Edit `playwright.config.ts` to:
- Change base URL
- Add more browsers
- Configure retries
- Set up CI/CD integration
- Add screenshots/videos on failure

## Best Practices

1. Use data-testid attributes for stable selectors
2. Avoid hardcoded waits - use Playwright's auto-waiting
3. Test user flows, not implementation details
4. Keep tests independent and isolated
5. Use Page Object Model for complex pages
6. Mock external APIs when appropriate
