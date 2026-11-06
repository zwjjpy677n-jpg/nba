import schedule from '../fixtures/schedule-min.json';
import { parseSchedule } from '../../src/api/schedule';

describe('parseSchedule', () => {
  it('parses games sorted by start with numeric final scores', () => {
    const games = parseSchedule(schedule);
    expect(games.length).toBeGreaterThan(0);
    const starts = games.map((g) => g.start);
    expect([...starts].sort()).toEqual(starts);
    const done = games.filter((g) => g.state === 'post');
    expect(done.length).toBeGreaterThan(0);
    expect(done.every((g) => typeof g.home.score === 'number' && typeof g.away.score === 'number')).toBe(true);
    expect(games.every((g) => g.home.team.abbr === 'min' || g.away.team.abbr === 'min')).toBe(true);
  });
  it('returns [] for empty schedule', () => {
    expect(parseSchedule({ events: [] })).toEqual([]);
    expect(parseSchedule(null)).toEqual([]);
  });
});
