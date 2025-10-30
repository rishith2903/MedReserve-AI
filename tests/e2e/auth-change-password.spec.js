import { test, expect } from '@playwright/test';

function randomEmail() {
  return `e2e_${Date.now()}_${Math.floor(Math.random()*1e6)}@example.com`;
}

function randomPhone() {
  // Generate a unique E.164-like Indian number for tests (not real): +9198XXXXXXX
  const suffix = String(Date.now()).slice(-9);
  return `+919${suffix}`;
}

const STRONG_PWD = 'StrongPwd1@';
const NEW_STRONG_PWD = 'NewStrongPwd1@';

async function signup(page, email) {
  await page.goto('/signup');
  await page.getByLabel('First Name').fill('E2E');
  await page.getByLabel('Last Name').fill('User');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Phone Number').fill(randomPhone());
  await page.locator('input[name="password"]').fill(STRONG_PWD);
  await page.locator('input[name="confirmPassword"]').fill(STRONG_PWD);
  await page.getByRole('button', { name: /sign up/i }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
}

async function login(page, email, password) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
}

async function changePassword(page) {
  await page.goto('/profile');
  await page.locator('input[name="currentPassword"]').fill(STRONG_PWD);
  await page.locator('input[name="newPassword"]').fill(NEW_STRONG_PWD);
  await page.locator('input[name="confirmNewPassword"]').fill(NEW_STRONG_PWD);
  await page.getByRole('button', { name: /change password/i }).click();
  await expect(page.getByText(/password changed successfully/i)).toBeVisible();
}

test('signup -> login -> change password -> login with new password', async ({ page }) => {
  const email = randomEmail();

  await signup(page, email);
  await login(page, email, STRONG_PWD);
  await changePassword(page);

  // Login with new password
  await login(page, email, NEW_STRONG_PWD);
});
