import { test, expect } from '@playwright/test';
import { mockEspn, fx } from './mockEspn';

test('日付ラベルとスコアカードが表示される', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/games');
  await expect(page.getByRole('heading', { name: '11月5日(木)' })).toBeVisible();
  await expect(page.locator('.score-card')).toHaveCount(14);
});

test('前の日・次の日で日付が変わる', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/games');
  await page.getByRole('button', { name: '次の日' }).click();
  await expect(page.getByRole('heading', { name: '11月6日(金)' })).toBeVisible();
  await page.getByRole('button', { name: '前の日' }).click();
  await page.getByRole('button', { name: '前の日' }).click();
  await expect(page.getByRole('heading', { name: '11月4日(水)' })).toBeVisible();
});

test('試合がない日', async ({ page }) => {
  await mockEspn(page, { scoreboard: { events: [] } });
  await page.goto('./#/games');
  await expect(page.getByText('この日の試合はありません')).toBeVisible();
});

test('取得失敗でエラー表示', async ({ page }) => {
  await mockEspn(page, { scoreboard: 'error' });
  await page.goto('./#/games');
  await expect(page.getByText('読み込めませんでした')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: '再試行' })).toBeVisible();
});

test('開始前の試合は開始時刻を表示', async ({ page }) => {
  await mockEspn(page, { scoreboard: fx('scoreboard-pre') });
  await page.goto('./#/games?d=2026-11-11');
  const first = page.locator('.score-card').first();
  await expect(first).toContainText('開始 9:30');
  await expect(first.locator('.score')).toHaveCount(0);
});

test('試合詳細に遷移してボックススコアを表示', async ({ page }) => {
  await mockEspn(page);
  await page.goto('./#/games');
  await page.locator('a.score-card[href$="/games/401909922"]').click();
  await expect(page).toHaveURL(/#\/games\/401909922$/);
  await expect(page.locator('table.box')).toHaveCount(2);
  await expect(page.locator('table.box').first().getByRole('columnheader', { name: 'PTS' })).toBeVisible();
  await expect(page.getByText('L. James')).toBeVisible();
});

test('試合詳細の取得失敗はその画面だけ', async ({ page }) => {
  await mockEspn(page, { summary: 'error' });
  await page.goto('./#/games/401909922');
  await expect(page.getByText('読み込めませんでした')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('navigation').getByRole('link', { name: '順位' }).click();
  await expect(page.getByRole('heading', { name: '順位', level: 1 })).toBeVisible();
});
