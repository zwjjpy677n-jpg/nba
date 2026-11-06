import post from '../fixtures/scoreboard-post.json';
import pre from '../fixtures/scoreboard-pre.json';
import { parseScoreboard, fetchGamesForJstDay } from '../../src/api/scoreboard';
import { TEAM_ABBRS } from '../../src/lib/settings';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe('parseScoreboard', () => {
  it('parses finished games', () => {
    const games = parseScoreboard(post);
    expect(games).toHaveLength(post.events.length);
    const g = games[0];
    expect(g.state).toBe('post');
    expect(typeof g.home.score).toBe('number');
    expect(typeof g.away.score).toBe('number');
    expect(g.home.linescores.length).toBeGreaterThanOrEqual(4);
    expect(g.home.winner || g.away.winner).toBe(true);
    expect(TEAM_ABBRS).toContain(g.home.team.abbr);
    expect(g.home.homeAway).toBe('home');
  });
  it('parses scheduled games without scores', () => {
    const games = parseScoreboard(pre);
    expect(games.length).toBeGreaterThan(0);
    for (const g of games) {
      expect(g.state).toBe('pre');
      expect(g.home.score).toBeNull();
      expect(g.home.linescores).toEqual([]);
    }
  });
  it('handles empty and invalid input', () => {
    expect(parseScoreboard({ events: [] })).toEqual([]);
    expect(parseScoreboard(null)).toEqual([]);
  });
  it('skips an event whose competitor lacks a team', () => {
    const data = clone(post) as any;
    delete data.events[0].competitions[0].competitors[0].team;
    expect(parseScoreboard(data)).toHaveLength(post.events.length - 1);
  });
});

describe('fetchGamesForJstDay', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('fetches both US dates and keeps games on the JST day', async () => {
    const mk = (id: string, date: string) => {
      const e = clone((post as any).events[0]);
      e.id = id;
      e.date = date;
      return e;
    };
    const fetchMock = vi.fn(async (url: string) => {
      const events = url.includes('dates=20261105')
        ? [mk('a', '2026-11-05T14:00Z'), mk('b', '2026-11-06T00:00Z')]
        : [mk('b', '2026-11-06T00:00Z'), mk('c', '2026-11-06T03:00Z')];
      return new Response(JSON.stringify({ events }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const games = await fetchGamesForJstDay('2026-11-06');
    const urls = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes('dates=20261105'))).toBe(true);
    expect(urls.some((u) => u.includes('dates=20261106'))).toBe(true);
    expect(games.map((g) => g.id)).toEqual(['b', 'c']);
  });
});
