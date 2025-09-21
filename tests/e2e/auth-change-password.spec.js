import { test, expect } from '@playwright/test';

function randomEmail() {
  return `e2e_${Date.now()}_${Math.floor(Math.random()*1e6)}@example.com`;
}

const STRONG_PWD = 'StrongPwd1@';
const NEW_STRONG_PWD = 'NewStrongPwd1@';

async function signup(page, email) {
  await page.goto('/signup');
  await page.getByLabel('First Name').fill('E2E');
  await page.getByLabel('Last Name').fill('User');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Phone Number').fill('+919876543210');
  await page.getByLabel('Password').fill(STRONG_PWD);
  await page.getByLabel('Confirm Password').fill(STRONG_PWD);
  await page.getByRole('button', { name: /sign up/i }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function login(page, email, password) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function changePassword(page) {
  await page.goto('/profile');
  await page.getByLabel('Current Password').fill(STRONG_PWD);
  await page.getByLabel('New Password').fill(NEW_STRONG_PWD);
  await page.getByLabel('Confirm New Password').fill(NEW_STRONG_PWD);
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
