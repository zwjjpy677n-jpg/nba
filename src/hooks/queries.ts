import { useQueries, useQuery } from '@tanstack/react-query';
import { fetchGamesForJstDay } from '../api/scoreboard';
import { fetchGameDetail } from '../api/game';
import { fetchStandings } from '../api/standings';
import { fetchRoster, fetchTeams, fetchTeamStats } from '../api/teams';
import { fetchSchedule } from '../api/schedule';
import { fetchPlayerStats, searchPlayers } from '../api/players';
import type { Game, RosterPlayer } from '../api/types';

const MIN = 60_000;
const HOUR = 60 * MIN;
export const LIVE_MS = 30_000;
const IDLE_SCOREBOARD_MS = 5 * MIN;
const HALF_HOUR = 30 * MIN;
const DAY = 24 * HOUR;

export function liveInterval(games: Game[] | undefined, idleMs: number | false): number | false {
  return games?.some((g) => g.state === 'in') ? LIVE_MS : idleMs;
}

export function useGamesForDay(jstDate: string) {
  return useQuery({
    queryKey: ['games', jstDate],
    queryFn: () => fetchGamesForJstDay(jstDate),
    staleTime: LIVE_MS,
    refetchInterval: (q) => liveInterval(q.state.data, IDLE_SCOREBOARD_MS),
  });
}

export function useGameDetail(id: string) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => fetchGameDetail(id),
    staleTime: LIVE_MS,
    refetchInterval: (q) => liveInterval(q.state.data ? [q.state.data.game] : undefined, false),
  });
}

export function useStandings() {
  return useQuery({ queryKey: ['standings'], queryFn: fetchStandings, staleTime: HALF_HOUR });
}

export function useTeams() {
  return useQuery({ queryKey: ['teams'], queryFn: fetchTeams, staleTime: DAY, gcTime: DAY });
}

export function useSchedule(abbr: string) {
  return useQuery({ queryKey: ['schedule', abbr], queryFn: () => fetchSchedule(abbr), staleTime: HALF_HOUR });
}

export function useRoster(abbr: string) {
  return useQuery({ queryKey: ['roster', abbr], queryFn: () => fetchRoster(abbr), staleTime: DAY, gcTime: DAY });
}

export function useTeamStats(abbr: string) {
  return useQuery({ queryKey: ['teamStats', abbr], queryFn: () => fetchTeamStats(abbr), staleTime: HALF_HOUR });
}

export function usePlayerSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ['playerSearch', q.toLowerCase()],
    queryFn: () => searchPlayers(q),
    enabled: q.length >= 2,
    staleTime: HOUR,
  });
}

export function usePlayerStats(id: string | null) {
  return useQuery({
    queryKey: ['playerStats', id],
    queryFn: () => fetchPlayerStats(id!),
    enabled: id !== null,
    staleTime: HALF_HOUR,
  });
}

export function useRosterStats(players: RosterPlayer[]) {
  return useQueries({
    queries: players.map((p) => ({
      queryKey: ['playerStats', p.id],
      queryFn: () => fetchPlayerStats(p.id),
      staleTime: HALF_HOUR,
    })),
  });
}
