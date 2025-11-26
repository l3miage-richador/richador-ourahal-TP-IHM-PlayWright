import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://alexdmr.github.io/l3m-2023-2024-angular-todolist//');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/L3m/);
});
