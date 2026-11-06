import { ESPN_V2, fetchJson } from './client';
import { arr, num, obj, str } from './parse';
import { parseTeamRef } from './scoreboard';
import type { StandingRow } from './types';

export function parseStandings(json: unknown): StandingRow[] {
  const rows: StandingRow[] = [];
  for (const child of arr(obj(json).children)) {
    const c = obj(child);
    const name = (str(c.name) ?? '').toLowerCase();
    const conference = name.startsWith('east') ? 'east' : name.startsWith('west') ? 'west' : null;
    if (!conference) continue;
    const confRows: StandingRow[] = [];
    for (const entry of arr(obj(c.standings).entries)) {
      const e = obj(entry);
      const team = parseTeamRef(e.team);
      if (!team) continue;
      const stats = new Map<string, unknown>();
      for (const s of arr(e.stats)) {
        const so = obj(s);
        const key = str(so.name);
        if (key) stats.set(key, so.displayValue ?? so.value);
      }
      confRows.push({
        team,
        conference,
        seed: num(stats.get('playoffSeed')),
        wins: num(stats.get('wins')),
        losses: num(stats.get('losses')),
        winPct: str(stats.get('winPercent')),
        gamesBehind: str(stats.get('gamesBehind')),
        streak: str(stats.get('streak')),
      });
    }
    confRows.sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99));
    rows.push(...confRows);
  }
  return rows;
}

export async function fetchStandings(): Promise<StandingRow[]> {
  return parseStandings(await fetchJson(`${ESPN_V2}/standings`));
}
