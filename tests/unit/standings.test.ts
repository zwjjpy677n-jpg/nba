import standings from '../fixtures/standings.json';
import { parseStandings } from '../../src/api/standings';

describe('parseStandings', () => {
  it('parses 30 rows split by conference and sorted by seed', () => {
    const rows = parseStandings(standings);
    expect(rows).toHaveLength(30);
    const east = rows.filter((r) => r.conference === 'east');
    const west = rows.filter((r) => r.conference === 'west');
    expect(east).toHaveLength(15);
    expect(west).toHaveLength(15);
    expect(east[0].seed).toBe(1);
    expect(west[0].seed).toBe(1);
    const min = rows.find((r) => r.team.abbr === 'min')!;
    expect(min.conference).toBe('west');
    expect(typeof min.wins).toBe('number');
    expect(typeof min.losses).toBe('number');
  });
  it('returns [] on invalid input', () => {
    expect(parseStandings(null)).toEqual([]);
    expect(parseStandings({})).toEqual([]);
  });
});
