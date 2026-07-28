import { expect, test } from '@playwright/test';

test('demo app renders icon output', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('/');

  await expect(page.locator('app-root')).toBeVisible();
  await expect(page.locator('.icon').first()).toBeVisible();
  await expect(page.locator('.icon p.sml').first()).not.toBeEmpty();
  await expect(page.locator('svg').first()).toBeVisible();

  expect(consoleErrors, 'browser console errors').toEqual([]);
  expect(pageErrors, 'uncaught page errors').toEqual([]);
});
