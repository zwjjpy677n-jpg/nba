import summary from '../fixtures/summary.json';
import { parseGameDetail } from '../../src/api/game';

describe('parseGameDetail', () => {
  it('parses header game and both box scores', () => {
    const d = parseGameDetail(summary, '401909922')!;
    expect(d.game.id).toBe('401909922');
    expect(d.game.state).toBe('post');
    expect(d.box).toHaveLength(2);
    for (const t of d.box) {
      expect(t.labels).toContain('PTS');
      expect(t.players[0].stats).toHaveLength(t.labels.length);
    }
    const all = d.box.flatMap((t) => t.players);
    expect(all.some((p) => p.dnp)).toBe(true);
    expect(all.filter((p) => p.dnp).every((p) => p.stats.length === 0)).toBe(true);
  });
  it('reads quarter scores from displayValue and they sum to the final score', () => {
    const d = parseGameDetail(summary, '401909922')!;
    for (const side of [d.game.home, d.game.away]) {
      expect(side.linescores.reduce((a, b) => a + b, 0)).toBe(side.score);
    }
  });
  it('returns null on invalid input', () => {
    expect(parseGameDetail(null, '1')).toBeNull();
    expect(parseGameDetail({}, '1')).toBeNull();
  });
});
