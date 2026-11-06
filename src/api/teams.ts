import { ESPN_SITE, fetchJson } from './client';
import { arr, num, obj, str } from './parse';
import { parseTeamRef } from './scoreboard';
import type { RosterPlayer, TeamRef, TeamSeasonStats } from './types';

export function parseTeams(json: unknown): TeamRef[] {
  const league = obj(arr(obj(arr(obj(json).sports)[0]).leagues)[0]);
  return arr(league.teams)
    .map((t) => parseTeamRef(obj(t).team))
    .filter((t): t is TeamRef => t !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchTeams(): Promise<TeamRef[]> {
  return parseTeams(await fetchJson(`${ESPN_SITE}/teams`));
}

export function parseRoster(json: unknown): RosterPlayer[] {
  return arr(obj(json).athletes).flatMap((a) => {
    const x = obj(a);
    const id = str(x.id);
    const name = str(x.displayName) ?? str(x.fullName);
    if (!id || !name) return [];
    return [{
      id,
      name,
      position: str(obj(x.position).abbreviation),
      jersey: str(x.jersey),
      headshot: str(obj(x.headshot).href),
    }];
  });
}

export async function fetchRoster(abbr: string): Promise<RosterPlayer[]> {
  return parseRoster(await fetchJson(`${ESPN_SITE}/teams/${abbr}/roster`));
}

const TEAM_STAT_KEYS: Record<keyof TeamSeasonStats, string> = {
  gp: 'gamesPlayed',
  pts: 'avgPoints',
  reb: 'avgRebounds',
  ast: 'avgAssists',
  stl: 'avgSteals',
  blk: 'avgBlocks',
  to: 'avgTurnovers',
  fgPct: 'fieldGoalPct',
  threePct: 'threePointFieldGoalPct',
  ftPct: 'freeThrowPct',
};

export function parseTeamStats(json: unknown): TeamSeasonStats {
  const values = new Map<string, number | null>();
  for (const cat of arr(obj(obj(obj(json).results).stats).categories)) {
    for (const s of arr(obj(cat).stats)) {
      const so = obj(s);
      const name = str(so.name);
      if (name && !values.has(name)) values.set(name, num(so.value) ?? num(so.displayValue));
    }
  }
  const out = {} as TeamSeasonStats;
  for (const [k, espn] of Object.entries(TEAM_STAT_KEYS) as [keyof TeamSeasonStats, string][]) {
    out[k] = values.get(espn) ?? null;
  }
  return out;
}

export async function fetchTeamStats(abbr: string): Promise<TeamSeasonStats> {
  return parseTeamStats(await fetchJson(`${ESPN_SITE}/teams/${abbr}/statistics`));
}
