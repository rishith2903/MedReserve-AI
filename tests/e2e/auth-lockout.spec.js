import { test, expect } from '@playwright/test';

async function attemptLogin(page, email, password) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

// This test relies on backend LoginAttemptService defaults: 5 attempts -> lockout
// It verifies that after 5 invalid attempts, the next attempt yields a lockout message
// Prereq: backend running on http://localhost:8080 and frontend on baseURL (default http://localhost:3000)
// Account used must exist. DataInitializer seeds demo accounts; we use patient@medreserve.com

test.describe('Login lockout protection', () => {
  // Use a seeded account that isn't used by other tests to avoid side effects
  const EMAIL = 'patient2@medreserve.com';
  const WRONG = 'nottherightpassword';

  test('locks user after too many failed attempts', async ({ page }) => {
    // Do 5 failed attempts (will set lock on backend); expect generic invalid creds
    for (let i = 0; i < 5; i++) {
      await attemptLogin(page, EMAIL, WRONG);
      await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    }

    // 6th attempt should be blocked by lockout guard
    await attemptLogin(page, EMAIL, WRONG);
    await expect(page.getByText(/too many failed login attempts/i)).toBeVisible();
  });
});