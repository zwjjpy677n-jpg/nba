import { ESPN_WEB, fetchJson } from './client';
import { arr, num, obj, str } from './parse';
import type { AthleteProfile, GameLogPoint, LeaderEntry } from './types';

const NBA = `${ESPN_WEB}/sports/basketball/nba`;

export function parseLeaders(json: unknown): LeaderEntry[] {
  const root = obj(json);
  const offensive = arr(root.categories).map(obj).find((c) => c.name === 'offensive');
  const ptsIdx = arr(offensive?.names).indexOf('avgPoints');
  return arr(root.athletes).flatMap((raw) => {
    const a = obj(raw);
    const ath = obj(a.athlete);
    const id = str(ath.id);
    const name = str(ath.displayName);
    if (!id || !name) return [];
    const cat = arr(a.categories).map(obj).find((c) => c.name === 'offensive');
    const team = str(ath.teamShortName);
    return [{
      id,
      name,
      shortName: str(ath.shortName) ?? name,
      teamAbbr: team ? team.toLowerCase() : null,
      headshot: str(obj(ath.headshot).href),
      ppg: ptsIdx >= 0 ? num(arr(cat?.totals)[ptsIdx]) : null,
    }];
  });
}

export async function fetchScoringLeaders(limit = 3): Promise<LeaderEntry[]> {
  const url = `${NBA}/statistics/byathlete?region=us&lang=en&isqualified=true&page=1&limit=${limit}&sort=offensive.avgPoints%3Adesc&category=offensive`;
  return parseLeaders(await fetchJson(url));
}

export function parseAthleteProfile(json: unknown): AthleteProfile | null {
  const a = obj(obj(json).athlete);
  const id = str(a.id);
  const name = str(a.displayName);
  if (!id || !name) return null;
  const team = str(obj(a.team).abbreviation);
  return {
    id,
    name,
    jersey: str(a.jersey),
    position: str(obj(a.position).abbreviation),
    teamAbbr: team ? team.toLowerCase() : null,
    headshot: str(obj(a.headshot).href),
  };
}

export async function fetchAthleteProfile(id: string): Promise<AthleteProfile | null> {
  return parseAthleteProfile(await fetchJson(`${NBA}/athletes/${encodeURIComponent(id)}`));
}

export function parseGameLog(json: unknown): GameLogPoint[] {
  const root = obj(json);
  const ptsIdx = arr(root.labels).indexOf('PTS');
  const events = obj(root.events);
  const season = arr(root.seasonTypes)
    .map(obj)
    .find((s) => /regular season/i.test(str(s.displayName) ?? ''));
  if (ptsIdx < 0 || !season) return [];
  const points: GameLogPoint[] = [];
  for (const cat of arr(season.categories)) {
    for (const raw of arr(obj(cat).events)) {
      const e = obj(raw);
      const eventId = str(e.eventId);
      const pts = num(arr(e.stats)[ptsIdx]);
      const meta = obj(eventId ? events[eventId] : undefined);
      const date = str(meta.gameDate);
      if (!eventId || pts === null || !date) continue;
      points.push({
        eventId,
        date,
        pts,
        opponent: str(obj(meta.opponent).abbreviation),
        result: str(meta.gameResult),
      });
    }
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchGameLog(id: string): Promise<GameLogPoint[]> {
  return parseGameLog(await fetchJson(`${NBA}/athletes/${encodeURIComponent(id)}/gamelog`));
}
