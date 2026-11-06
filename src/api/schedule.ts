import { ESPN_SITE, fetchJson } from './client';
import { parseScoreboard } from './scoreboard';
import type { Game } from './types';

export function parseSchedule(json: unknown): Game[] {
  return parseScoreboard(json).sort((a, b) => a.start.localeCompare(b.start));
}

export async function fetchSchedule(abbr: string): Promise<Game[]> {
  return parseSchedule(await fetchJson(`${ESPN_SITE}/teams/${abbr}/schedule`));
}
