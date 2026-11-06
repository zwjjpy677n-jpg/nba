import type { Game, StandingRow } from '../api/types';

export type ConfFilter = 'all' | 'east' | 'west';

export function conferenceMap(rows: StandingRow[]): Map<string, 'east' | 'west'> {
  return new Map(rows.map((r) => [r.team.abbr, r.conference]));
}

export function filterByConference(games: Game[], map: Map<string, 'east' | 'west'>, conf: ConfFilter): Game[] {
  if (conf === 'all' || map.size === 0) return games;
  return games.filter((g) => map.get(g.home.team.abbr) === conf || map.get(g.away.team.abbr) === conf);
}
