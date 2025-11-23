/**
 * E2E tests for service pages
 */

import { test, expect } from '@playwright/test';

test.describe('Service Pages', () => {
  test('should display tarot service page', async ({ page }) => {
    await page.goto('/services/tarot');
    
    await expect(page.locator('h1')).toContainText(/tarot/i);
    
    // Should have spread selection
    await expect(page.locator('text=/spread|cards/i')).toBeVisible();
  });

  test('should display horoscope service page', async ({ page }) => {
    await page.goto('/services/horoscope');
    
    await expect(page.locator('h1')).toContainText(/horoscope/i);
    
    // Should have zodiac sign selection
    await expect(page.locator('text=/aries|taurus|gemini/i')).toBeVisible();
  });

  test('should display natal chart service page', async ({ page }) => {
    await page.goto('/services/natal');
    
    await expect(page.locator('h1')).toContainText(/natal.*chart/i);
    
    // Should have birth data form
    await expect(page.locator('input[type="date"], input[placeholder*="date"]')).toBeVisible();
  });

  test('should navigate from dashboard to services', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on tarot service card
    await page.click('text=/tarot/i');
    
    await expect(page).toHaveURL(/\/services\/tarot/);
  });
});
