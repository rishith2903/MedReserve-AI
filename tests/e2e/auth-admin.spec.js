import { test, expect } from '@playwright/test';

// Helpers
async function login(page, email, password) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test.describe('Auth and Admin access (requires backend running)', () => {
  test('redirects to /login when accessing a protected route unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('non-admin user is redirected to /not-authorized for admin routes', async ({ page }) => {
    await login(page, 'patient@medreserve.com', 'password123');
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/not-authorized$/);
  });

  test('admin user can access admin routes', async ({ page }) => {
    await login(page, 'demo@medreserve.com', 'password123');
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/users$/);
  });
});
