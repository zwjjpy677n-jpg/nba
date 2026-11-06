import search from '../fixtures/search-edwards.json';
import overview from '../fixtures/overview-4594268.json';
import { parsePlayerSearch, parsePlayerOverview, searchPlayers, hasStats } from '../../src/api/players';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe('players', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('parsePlayerSearch returns NBA players with team names', () => {
    const hits = parsePlayerSearch(search);
    expect(hits[0]).toEqual({ id: '4594268', name: 'Anthony Edwards', teamName: 'Minnesota Timberwolves' });
  });

  it('parsePlayerOverview uses the Regular Season split, not Career', () => {
    const s = parsePlayerOverview(overview);
    const split = (overview as any).statistics.splits.find((x: any) => x.displayName === 'Regular Season');
    const names: string[] = (overview as any).statistics.names;
    expect(s.pts).toBe(Number(split.stats[names.indexOf('avgPoints')]));
    expect(s.gp).toBe(Number(split.stats[names.indexOf('gamesPlayed')]));
    expect(typeof s.reb).toBe('number');
    expect(typeof s.ast).toBe('number');
    expect(typeof s.fgPct).toBe('number');
    expect(hasStats(s)).toBe(true);
  });

  it('returns all nulls when there is no Regular Season split', () => {
    const data = clone(overview) as any;
    data.statistics.splits = data.statistics.splits.filter((x: any) => x.displayName !== 'Regular Season');
    const s = parsePlayerOverview(data);
    expect(Object.values(s).every((v) => v === null)).toBe(true);
    expect(hasStats(s)).toBe(false);
  });

  it('searchPlayers skips queries shorter than 2 characters', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    await expect(searchPlayers(' a ')).resolves.toEqual([]);
    expect(f).not.toHaveBeenCalled();
  });
});
