/**
 * E2E tests for authentication flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.locator('h1')).toContainText(/login|sign in/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display registration page', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page.locator('h1')).toContainText(/register|sign up/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/invalid.*email/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click register link
    await page.click('text=/sign up|register/i');
    
    await expect(page).toHaveURL(/\/auth\/register/);
    
    // Click login link
    await page.click('text=/sign in|login/i');
    
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
