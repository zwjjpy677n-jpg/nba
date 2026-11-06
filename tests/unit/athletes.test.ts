import leaders from '../fixtures/leaders.json';
import athlete from '../fixtures/athlete-4594268.json';
import gamelog from '../fixtures/gamelog-4594268.json';
import teams from '../fixtures/teams.json';
import { parseLeaders, parseAthleteProfile, parseGameLog } from '../../src/api/athletes';
import { parseTeams } from '../../src/api/teams';

describe('parseLeaders', () => {
  it('returns scoring leaders in order with PPG and headshots', () => {
    const l = parseLeaders(leaders);
    expect(l).toHaveLength(3);
    expect(l[0]).toMatchObject({ id: '3945274', name: 'Luka Doncic', teamAbbr: 'lal', ppg: 38.5 });
    expect(l[0].headshot).toMatch(/^https:\/\/a\.espncdn\.com\//);
    expect(l[0].ppg!).toBeGreaterThanOrEqual(l[1].ppg!);
  });
  it('returns [] for invalid input', () => {
    expect(parseLeaders(null)).toEqual([]);
  });
});

describe('parseAthleteProfile', () => {
  it('reads jersey, position, team and headshot', () => {
    expect(parseAthleteProfile(athlete)).toEqual({
      id: '4594268',
      name: 'Anthony Edwards',
      jersey: '5',
      position: 'G',
      teamAbbr: 'min',
      headshot: 'https://a.espncdn.com/i/headshots/nba/players/full/4594268.png',
    });
  });
  it('returns null for invalid input', () => {
    expect(parseAthleteProfile({})).toBeNull();
  });
});

describe('parseGameLog', () => {
  it('returns regular-season points per game in date order', () => {
    const log = parseGameLog(gamelog);
    expect(log.length).toBe(4);
    const dates = log.map((p) => p.date);
    expect([...dates].sort()).toEqual(dates);
    const first = log.find((p) => p.eventId === '401909869')!;
    expect(first.pts).toBe(47); // PTS column, not MIN (41)
    expect(log.reduce((s, p) => s + p.pts, 0) / log.length).toBeCloseTo(33.25);
    expect(first.opponent).toBeTruthy();
  });
  it('returns [] for invalid input', () => {
    expect(parseGameLog(null)).toEqual([]);
  });
});

describe('team colors', () => {
  it('parseTeams includes the team color as #hex', () => {
    const min = parseTeams(teams).find((t) => t.abbr === 'min')!;
    expect(min.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
