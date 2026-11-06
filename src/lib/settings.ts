export const TEAM_ABBRS = [
  'atl', 'bos', 'bkn', 'cha', 'chi', 'cle', 'dal', 'den', 'det', 'gs',
  'hou', 'ind', 'lac', 'lal', 'mem', 'mia', 'mil', 'min', 'no', 'ny',
  'okc', 'orl', 'phi', 'phx', 'por', 'sac', 'sa', 'tor', 'utah', 'wsh',
] as const;

export const DEFAULT_TEAM = 'min';
const KEY = 'nba.favoriteTeam';

export function getFavoriteTeam(): string {
  try {
    const v = localStorage.getItem(KEY);
    if (v && (TEAM_ABBRS as readonly string[]).includes(v)) return v;
  } catch {
    // storage unavailable
  }
  return DEFAULT_TEAM;
}

export function setFavoriteTeam(abbr: string): void {
  try {
    localStorage.setItem(KEY, abbr);
  } catch {
    // storage unavailable
  }
}
