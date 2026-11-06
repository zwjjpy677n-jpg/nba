import { test, expect } from '@playwright/test';
import { mockEspn, fx } from './mockEspn';

test('選手を検索して今季成績を表示', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/stats');
  await page.getByLabel('選手を検索').fill('edwards');
  await page.getByRole('button', { name: /Anthony Edwards/ }).click();
  const grid = page.locator('.stat-grid');
  await expect(grid).toContainText('得点');
  await expect(grid).toContainText('33.3');
});

test('今季の出場記録がない選手', async ({ page }) => {
  const ov = fx('overview-4594268');
  ov.statistics.splits = [];
  await mockEspn(page, { overview: ov });
  await page.goto('./#/stats');
  await page.getByLabel('選手を検索').fill('edwards');
  await page.getByRole('button', { name: /Anthony Edwards/ }).click();
  await expect(page.getByText('今季の出場記録はありません')).toBeVisible();
});

test('検索結果なし', async ({ page }) => {
  await mockEspn(page, { search: { items: [] } });
  await page.goto('./#/stats');
  await page.getByLabel('選手を検索').fill('zzzz');
  await expect(page.getByText('該当する選手がいません')).toBeVisible();
});

test('2人を比較', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/stats');
  await page.getByRole('button', { name: '比較' }).click();
  await page.getByLabel('選手Aを検索').fill('edwards');
  await page.getByRole('button', { name: /Anthony Edwards/ }).click();
  await page.getByLabel('選手Bを検索').fill('edwards');
  await page.getByRole('button', { name: /Jesse Edwards/ }).click();
  await expect(page.locator('[data-testid^="cmp-"]')).toHaveCount(8);
});

test('チーム成績は推しチームが初期選択', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/stats');
  await page.getByRole('button', { name: 'チーム' }).click();
  await expect(page.getByLabel('チーム', { exact: true })).toHaveValue('min');
  await expect(page.locator('.stat-grid')).toContainText('得点');
  const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(ok).toBe(true);
});
