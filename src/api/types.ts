export type GameState = 'pre' | 'in' | 'post';
export interface TeamRef { id: string; abbr: string; name: string; shortName: string; logo: string | null }
export interface GameSide { team: TeamRef; homeAway: 'home' | 'away'; score: number | null; winner: boolean | null; linescores: number[]; record: string | null }
export interface Game { id: string; start: string; state: GameState; completed: boolean; statusText: string; home: GameSide; away: GameSide }
export interface BoxPlayer { id: string; name: string; starter: boolean; dnp: boolean; stats: string[] }
export interface BoxTeam { teamAbbr: string; labels: string[]; players: BoxPlayer[] }
export interface GameDetail { game: Game; box: BoxTeam[] }
export interface StandingRow { team: TeamRef; conference: 'east' | 'west'; seed: number | null; wins: number | null; losses: number | null; winPct: string | null; gamesBehind: string | null; streak: string | null }
export interface RosterPlayer { id: string; name: string; position: string | null; jersey: string | null; headshot: string | null }
export interface PlayerHit { id: string; name: string; teamName: string | null }
export interface PlayerSeasonStats { gp: number | null; min: number | null; pts: number | null; reb: number | null; ast: number | null; stl: number | null; blk: number | null; fgPct: number | null; threePct: number | null; ftPct: number | null }
export interface TeamSeasonStats { gp: number | null; pts: number | null; reb: number | null; ast: number | null; stl: number | null; blk: number | null; to: number | null; fgPct: number | null; threePct: number | null; ftPct: number | null }
