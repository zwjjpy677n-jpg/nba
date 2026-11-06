import { ApiError, ESPN_SITE, fetchJson } from './client';
import { arr, obj, str } from './parse';
import { parseCompetition } from './scoreboard';
import type { BoxPlayer, BoxTeam, GameDetail } from './types';

function parseBoxTeam(raw: unknown): BoxTeam | null {
  const p = obj(raw);
  const teamAbbr = str(obj(p.team).abbreviation);
  const st = obj(arr(p.statistics)[0]);
  const labels = arr(st.labels ?? st.names).map((l) => str(l) ?? '');
  if (!teamAbbr || labels.length === 0) return null;
  const players: BoxPlayer[] = arr(st.athletes).flatMap((a) => {
    const x = obj(a);
    const ath = obj(x.athlete);
    const id = str(ath.id);
    const name = str(ath.shortName) ?? str(ath.displayName);
    if (!id || !name) return [];
    return [{
      id,
      name,
      starter: x.starter === true,
      dnp: x.didNotPlay === true,
      stats: arr(x.stats).map((s) => str(s) ?? ''),
    }];
  });
  return { teamAbbr: teamAbbr.toLowerCase(), labels, players };
}

export function parseGameDetail(json: unknown, id: string): GameDetail | null {
  const root = obj(json);
  const header = obj(root.header);
  const comp = obj(arr(header.competitions)[0]);
  const start = str(comp.date);
  if (!start) return null;
  const game = parseCompetition(comp, id, start);
  if (!game) return null;
  const box = arr(obj(root.boxscore).players)
    .map(parseBoxTeam)
    .filter((b): b is BoxTeam => b !== null);
  return { game, box };
}

export async function fetchGameDetail(id: string): Promise<GameDetail> {
  const d = parseGameDetail(await fetchJson(`${ESPN_SITE}/summary?event=${encodeURIComponent(id)}`), id);
  if (!d) throw new ApiError('parse', `unexpected summary shape: ${id}`);
  return d;
}
