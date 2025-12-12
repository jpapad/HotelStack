import { test, expect } from '@playwright/test';

test('login and navigate to dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('manager@test.com');
  await page.getByLabel('Password').fill('manager123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText('Arrivals', { exact: true })).toBeVisible();
});

test('navigate to reservations from sidebar', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('manager@test.com');
  await page.getByLabel('Password').fill('manager123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole('link', { name: 'Reservations' }).click();
  await expect(page).toHaveURL(/\/reservations/);
  await expect(page.getByText('Confirmation', { exact: true })).toBeVisible();
});
