import { fetchJson, ESPN_SITE } from './client';
import { arr, num, obj, str } from './parse';
import type { Game, GameSide, GameState, TeamRef } from './types';
import { jstDateOf, usDatesForJstDay } from '../lib/dates';

export function parseTeamRef(raw: unknown): TeamRef | null {
  const t = obj(raw);
  const id = str(t.id);
  const abbr = str(t.abbreviation);
  if (!id || !abbr) return null;
  const logos = arr(t.logos);
  const logo = str(t.logo) ?? str(obj(logos[0]).href);
  const hex = str(t.color);
  return {
    id,
    abbr: abbr.toLowerCase(),
    name: str(t.displayName) ?? abbr,
    shortName: str(t.shortDisplayName) ?? str(t.name) ?? abbr,
    logo,
    color: hex && /^[0-9a-f]{6}$/i.test(hex) ? `#${hex}` : null,
  };
}

function parseScore(v: unknown): number | null {
  return typeof v === 'object' && v !== null ? num(obj(v).value) : num(v);
}

function parseSide(raw: unknown, state: GameState): GameSide | null {
  const c = obj(raw);
  const team = parseTeamRef(c.team);
  const homeAway = c.homeAway === 'home' ? 'home' : c.homeAway === 'away' ? 'away' : null;
  if (!team || !homeAway) return null;
  const records = arr(c.records ?? c.record);
  return {
    team,
    homeAway,
    score: state === 'pre' ? null : parseScore(c.score),
    winner: typeof c.winner === 'boolean' ? c.winner : null,
    linescores: state === 'pre' ? [] : arr(c.linescores).map((l) => num(obj(l).value) ?? num(obj(l).displayValue) ?? 0),
    record: str(obj(records[0]).summary) ?? str(obj(records[0]).displayValue),
  };
}

function parseState(v: unknown): GameState {
  return v === 'in' || v === 'post' ? v : 'pre';
}

export function parseCompetition(comp: unknown, id: string, start: string): Game | null {
  const c = obj(comp);
  const statusType = obj(obj(c.status).type);
  const state = parseState(statusType.state);
  const sides = arr(c.competitors).map((x) => parseSide(x, state));
  const home = sides.find((s) => s?.homeAway === 'home');
  const away = sides.find((s) => s?.homeAway === 'away');
  if (!home || !away || sides.some((s) => s === null)) return null;
  return {
    id,
    start,
    state,
    completed: state === 'post' && statusType.completed !== false,
    statusText: str(statusType.shortDetail) ?? str(statusType.detail) ?? '',
    home,
    away,
  };
}

export function parseEvent(raw: unknown): Game | null {
  const e = obj(raw);
  const id = str(e.id);
  const start = str(e.date);
  if (!id || !start) return null;
  const comp = obj(arr(e.competitions)[0]);
  // scoreboard puts status on the event; schedule puts it on the competition
  const withStatus = comp.status ? comp : { ...comp, status: e.status };
  return parseCompetition(withStatus, id, start);
}

export function parseScoreboard(json: unknown): Game[] {
  return arr(obj(json).events)
    .map(parseEvent)
    .filter((g): g is Game => g !== null);
}

export async function fetchGamesForJstDay(jstDate: string): Promise<Game[]> {
  const days = usDatesForJstDay(jstDate);
  const results = await Promise.all(days.map((d) => fetchJson(`${ESPN_SITE}/scoreboard?dates=${d}`)));
  const byId = new Map<string, Game>();
  for (const r of results) for (const g of parseScoreboard(r)) byId.set(g.id, g);
  return [...byId.values()]
    .filter((g) => jstDateOf(g.start) === jstDate)
    .sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
}
