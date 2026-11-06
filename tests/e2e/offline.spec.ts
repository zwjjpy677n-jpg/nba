import { test, expect } from '@playwright/test';
import { mockEspn } from './mockEspn';

test.use({ serviceWorkers: 'allow' });

test('オフラインでは保存済みデータと「◯分前の情報」を表示', async ({ page, context }) => {
  await mockEspn(page, {}, context); // context-level so service-worker fetches are mocked too
  await page.goto('./#/standings');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); // now controlled by the SW, responses get cached
  await expect(page.locator('table.standings tbody tr')).toHaveCount(15);
  await expect(page.locator('.offline-banner')).toHaveCount(0);

  // Route mocks keep answering even with setOffline, so make ESPN unreachable explicitly.
  await context.unrouteAll({ behavior: 'ignoreErrors' });
  await context.route(/^https:\/\/(site(\.web)?\.api\.espn\.com|a\.espncdn\.com)\//, (route) => route.abort('internetdisconnected'));
  await page.reload();
  await expect(page.locator('table.standings tbody tr')).toHaveCount(15);
  await expect(page.locator('.offline-banner')).toContainText('の情報');
});
