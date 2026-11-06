import teams from '../fixtures/teams.json';
import roster from '../fixtures/roster-min.json';
import teamstats from '../fixtures/teamstats-min.json';
import { parseTeams, parseRoster, parseTeamStats } from '../../src/api/teams';

describe('teams', () => {
  it('parseTeams returns 30 teams with ESPN logos', () => {
    const t = parseTeams(teams);
    expect(t).toHaveLength(30);
    expect(t.every((x) => x.logo?.startsWith('https://a.espncdn.com/'))).toBe(true);
  });
  it('parseRoster returns players with id and name', () => {
    const r = parseRoster(roster);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.id && p.name)).toBe(true);
  });
  it('parseTeamStats returns season averages', () => {
    const s = parseTeamStats(teamstats);
    expect(typeof s.gp).toBe('number');
    expect(typeof s.pts).toBe('number');
    expect(s.fgPct).toBeGreaterThan(0);
    expect(s.fgPct).toBeLessThan(100);
    expect(typeof s.threePct).toBe('number');
  });
  it('handles invalid input', () => {
    expect(parseTeams(null)).toEqual([]);
    expect(parseRoster({})).toEqual([]);
    expect(Object.values(parseTeamStats(null)).every((v) => v === null)).toBe(true);
  });
});
