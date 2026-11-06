import { test, expect } from '@playwright/test';
import { mockEspn } from './mockEspn';

test('ホームに推しチームのセクションが並ぶ', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'Minnesota Timberwolves' })).toBeVisible();
  for (const name of ['次の試合', '直近5試合', '順位', '主力選手']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
  }
  await expect(page.locator('.top-players li')).toHaveCount(5);
  const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(ok).toBe(true);
});

test('直近5試合はW/Lで5行', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./');
  const rows = page.locator('.recent li');
  await expect(rows).toHaveCount(5);
  for (const t of await rows.allTextContents()) expect(t).toMatch(/^[WL]/);
});

test('日程が空でも他のセクションは表示', async ({ page }) => {
  await mockEspn(page, { schedule: { events: [] } });
  await page.goto('./');
  await expect(page.getByText('予定されている試合はありません')).toBeVisible();
  await expect(page.locator('tr[aria-current="true"]')).toBeVisible();
});

test('設定で推しチームを変えるとホームに反映され、再読み込み後も保持', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/settings');
  await page.getByRole('button', { name: /Los Angeles Lakers/ }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'ホーム' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Los Angeles Lakers' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Los Angeles Lakers' })).toBeVisible();
});
