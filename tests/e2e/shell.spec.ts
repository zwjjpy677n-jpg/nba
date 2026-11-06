import { test, expect } from '@playwright/test';

test('下部タブ4つが表示される', async ({ page }) => {
  await page.goto('./');
  const nav = page.getByRole('navigation');
  for (const name of ['ホーム', '試合', '順位', 'スタッツ']) {
    await expect(nav.getByRole('link', { name })).toBeVisible();
  }
});

test('タブで画面が切り替わる', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation').getByRole('link', { name: '順位' }).click();
  await expect(page).toHaveURL(/#\/standings$/);
  await expect(page.getByRole('heading', { name: '順位', level: 1 })).toBeVisible();
});

test('設定ボタン', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: '設定' }).click();
  await expect(page.getByRole('heading', { name: '設定', level: 1 })).toBeVisible();
});

test('横スクロールなし', async ({ page }) => {
  await page.goto('./');
  const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(ok).toBe(true);
});
