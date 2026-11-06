import { test, expect } from '@playwright/test';
import { mockEspn } from './mockEspn';

test('ホームにHOT PLAYERS（リーグ得点上位3人）', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./');
  const hot = page.locator('.hot-players li');
  await expect(hot).toHaveCount(3);
  await expect(hot.first()).toContainText('L. Doncic');
  await expect(hot.first()).toContainText('38.5');
});

test('ホームのヒーローにチーム名とエースの顔写真', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./');
  const hero = page.locator('.hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Minnesota Timberwolves');
  await expect(hero.locator('img.hero-player')).toHaveCount(1);
});

test('試合タブを東西で絞り込める', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/games');
  await expect(page.locator('.score-card')).toHaveCount(14);
  await page.getByRole('button', { name: '東カンファレンス' }).click();
  const east = await page.locator('.score-card').count();
  expect(east).toBeGreaterThan(0);
  expect(east).toBeLessThan(14);
  await page.getByRole('button', { name: 'すべて' }).click();
  await expect(page.locator('.score-card')).toHaveCount(14);
});

test('選手カードと得点推移グラフ', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/stats');
  await page.getByLabel('選手を検索').fill('edwards');
  await page.getByRole('button', { name: /Anthony Edwards/ }).click();
  const card = page.locator('.player-card');
  await expect(card).toContainText('#5');
  await expect(card).toContainText('G');
  await expect(card).toContainText('MIN');
  await expect(card).toContainText('33.3');
  await expect(page.locator('.pts-chart [data-testid="pt"]')).toHaveCount(4);
  const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(ok).toBe(true);
});
