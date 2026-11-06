import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const fx = (name: string) => JSON.parse(readFileSync(path.join(dir, `${name}.json`), 'utf8'));

export type MockKey =
  | 'scoreboard' | 'summary' | 'standings' | 'teams' | 'schedule'
  | 'roster' | 'teamstats' | 'search' | 'overview';
export type Overrides = Partial<Record<MockKey, object | 'error'>>;

export const FIXTURE_NOW = new Date('2026-11-05T03:00:00Z'); // JST 2026-11-05 12:00

const defaults: Record<MockKey, () => object> = {
  scoreboard: () => fx('scoreboard-post'),
  summary: () => fx('summary'),
  standings: () => fx('standings'),
  teams: () => fx('teams'),
  schedule: () => fx('schedule-min'),
  roster: () => fx('roster-min'),
  teamstats: () => fx('teamstats-min'),
  search: () => fx('search-edwards'),
  overview: () => fx('overview-4594268'),
};

function keyFor(url: string): MockKey | null {
  if (url.includes('/scoreboard')) return 'scoreboard';
  if (url.includes('/summary')) return 'summary';
  if (url.includes('/standings')) return 'standings';
  if (/\/teams\/[^/]+\/schedule/.test(url)) return 'schedule';
  if (/\/teams\/[^/]+\/roster/.test(url)) return 'roster';
  if (/\/teams\/[^/]+\/statistics/.test(url)) return 'teamstats';
  if (/\/teams(\?|$)/.test(url)) return 'teams';
  if (url.includes('/search')) return 'search';
  if (url.includes('/overview')) return 'overview';
  return null;
}

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export async function mockEspn(page: Page, overrides: Overrides = {}) {
  await page.clock.setFixedTime(FIXTURE_NOW);
  await page.route(/^https:\/\/site(\.web)?\.api\.espn\.com\//, async (route) => {
    const key = keyFor(route.request().url());
    if (!key) return route.fulfill({ status: 404, body: 'unmocked' });
    const o = overrides[key];
    if (o === 'error') return route.fulfill({ status: 500, body: 'error' });
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(o ?? defaults[key]()),
    });
  });
  await page.route(/^https:\/\/a\.espncdn\.com\//, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1PX }),
  );
}

export { fx };
