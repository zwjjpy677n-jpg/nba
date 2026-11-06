import { ESPN_WEB, fetchJson } from './client';
import { arr, num, obj, str } from './parse';
import type { PlayerHit, PlayerSeasonStats } from './types';

export function parsePlayerSearch(json: unknown): PlayerHit[] {
  return arr(obj(json).items).flatMap((raw) => {
    const i = obj(raw);
    if (i.type !== 'player' || (i.league !== undefined && i.league !== 'nba')) return [];
    const id = str(i.id);
    const name = str(i.displayName);
    if (!id || !name) return [];
    const team = arr(i.teamRelationships).map(obj).find((r) => r.type === 'team');
    return [{ id, name, teamName: str(obj(team?.core).displayName) }];
  });
}

export async function searchPlayers(query: string): Promise<PlayerHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `${ESPN_WEB}/search?query=${encodeURIComponent(q)}&type=player&sport=basketball&league=nba&limit=10`;
  return parsePlayerSearch(await fetchJson(url));
}

const PLAYER_STAT_KEYS: Record<keyof PlayerSeasonStats, string> = {
  gp: 'gamesPlayed',
  min: 'avgMinutes',
  pts: 'avgPoints',
  reb: 'avgRebounds',
  ast: 'avgAssists',
  stl: 'avgSteals',
  blk: 'avgBlocks',
  fgPct: 'fieldGoalPct',
  threePct: 'threePointPct',
  ftPct: 'freeThrowPct',
};

export function parsePlayerOverview(json: unknown): PlayerSeasonStats {
  const st = obj(obj(json).statistics);
  const names = arr(st.names).map((n) => str(n));
  const split = arr(st.splits).map(obj).find((s) => s.displayName === 'Regular Season');
  const values = arr(split?.stats);
  const out = {} as PlayerSeasonStats;
  for (const [k, espn] of Object.entries(PLAYER_STAT_KEYS) as [keyof PlayerSeasonStats, string][]) {
    const idx = names.indexOf(espn);
    out[k] = idx >= 0 ? num(values[idx]) : null;
  }
  return out;
}

export async function fetchPlayerStats(id: string): Promise<PlayerSeasonStats> {
  return parsePlayerOverview(
    await fetchJson(`${ESPN_WEB}/sports/basketball/nba/athletes/${encodeURIComponent(id)}/overview`),
  );
}

export function hasStats(s: PlayerSeasonStats): boolean {
  return s.gp !== null && s.gp >= 1;
}
