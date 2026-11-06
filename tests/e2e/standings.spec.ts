import { test, expect } from '@playwright/test';
import { mockEspn } from './mockEspn';

test('推しチームのカンファレンスを初期表示し、東西を切り替えられる', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/standings');
  const table = page.locator('table.standings');
  await expect(table.locator('tbody tr')).toHaveCount(15);
  await expect(page.getByRole('button', { name: '西', pressed: true })).toBeVisible();
  await expect(table).toContainText('Timberwolves');
  await page.getByRole('button', { name: '東' }).click();
  await expect(page.getByRole('button', { name: '東', pressed: true })).toBeVisible();
  await expect(table).not.toContainText('Timberwolves');
  await expect(table).toContainText('Celtics');
});

test('列見出し', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/standings');
  for (const name of ['順位', 'チーム', '勝', '敗', '勝率', '差', '連続']) {
    await expect(page.getByRole('columnheader', { name, exact: true })).toBeVisible();
  }
});

test('推しチームの行を強調', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/standings');
  await expect(page.locator('tr[aria-current="true"]')).toContainText('Timberwolves');
  const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(ok).toBe(true);
});

test('取得失敗', async ({ page }) => {
  await mockEspn(page, { standings: 'error' });
  await page.goto('./#/standings');
  await expect(page.getByText('読み込めませんでした')).toBeVisible({ timeout: 15_000 });
});
