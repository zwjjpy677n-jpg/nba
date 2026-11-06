import { useSyncExternalStore } from 'react';

export const TEAM_ABBRS = [
  'atl', 'bos', 'bkn', 'cha', 'chi', 'cle', 'dal', 'den', 'det', 'gs',
  'hou', 'ind', 'lac', 'lal', 'mem', 'mia', 'mil', 'min', 'no', 'ny',
  'okc', 'orl', 'phi', 'phx', 'por', 'sac', 'sa', 'tor', 'utah', 'wsh',
] as const;

export const DEFAULT_TEAM = 'min';
const KEY = 'nba.favoriteTeam';
const listeners = new Set<() => void>();
let memory: string | null = null;

const isTeam = (v: string | null): v is string => !!v && (TEAM_ABBRS as readonly string[]).includes(v);

export function getFavoriteTeam(): string {
  try {
    const v = localStorage.getItem(KEY);
    if (isTeam(v)) return v;
  } catch {
    if (isTeam(memory)) return memory;
  }
  return DEFAULT_TEAM;
}

export function setFavoriteTeam(abbr: string): void {
  try {
    localStorage.setItem(KEY, abbr);
  } catch {
    memory = abbr; // storage unavailable; keep for this session only
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

export function useFavoriteTeam(): [string, (abbr: string) => void] {
  const team = useSyncExternalStore(subscribe, getFavoriteTeam, () => DEFAULT_TEAM);
  return [team, setFavoriteTeam];
}
