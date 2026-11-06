import post from '../fixtures/scoreboard-post.json';
import standings from '../fixtures/standings.json';
import { parseScoreboard } from '../../src/api/scoreboard';
import { parseStandings } from '../../src/api/standings';
import { conferenceMap, filterByConference } from '../../src/lib/conference';

describe('filterByConference', () => {
  const games = parseScoreboard(post);
  const map = conferenceMap(parseStandings(standings));
  it('maps all 30 teams', () => {
    expect(map.size).toBe(30);
    expect(map.get('min')).toBe('west');
    expect(map.get('bos')).toBe('east');
  });
  it('all keeps every game', () => {
    expect(filterByConference(games, map, 'all')).toHaveLength(games.length);
  });
  it('east/west keep games involving a team from that conference', () => {
    const east = filterByConference(games, map, 'east');
    const west = filterByConference(games, map, 'west');
    expect(east.length).toBeGreaterThan(0);
    expect(east.length).toBeLessThan(games.length);
    for (const g of east) expect([map.get(g.home.team.abbr), map.get(g.away.team.abbr)]).toContain('east');
    for (const g of west) expect([map.get(g.home.team.abbr), map.get(g.away.team.abbr)]).toContain('west');
  });
  it('keeps games unfiltered when the conference map is empty', () => {
    expect(filterByConference(games, new Map(), 'east')).toHaveLength(games.length);
  });
});
