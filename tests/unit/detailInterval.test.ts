import { detailInterval, LIVE_MS } from '../../src/hooks/queries';
import type { Game } from '../../src/api/types';

const g = (state: Game['state'], start: string, completed = state === 'post') => ({ state, start, completed }) as Game;
const NOW = Date.parse('2026-11-06T00:00:00Z');

describe('detailInterval', () => {
  it('polls live games every 30s', () => {
    expect(detailInterval(g('in', '2026-11-05T23:00:00Z'), NOW)).toBe(LIVE_MS);
  });
  it('polls pre-game within 15 minutes of tip-off or after scheduled start', () => {
    expect(detailInterval(g('pre', '2026-11-06T00:10:00Z'), NOW)).toBe(60_000);
    expect(detailInterval(g('pre', '2026-11-05T23:50:00Z'), NOW)).toBe(60_000);
  });
  it('does not poll far-off pre-game or finished games', () => {
    expect(detailInterval(g('pre', '2026-11-06T03:00:00Z'), NOW)).toBe(false);
    expect(detailInterval(g('post', '2026-11-05T20:00:00Z'), NOW)).toBe(false);
  });
});
