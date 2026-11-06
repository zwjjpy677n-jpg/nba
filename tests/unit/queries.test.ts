import { liveInterval } from '../../src/hooks/queries';
import type { Game } from '../../src/api/types';

const g = (state: Game['state']) => ({ state }) as Game;

describe('liveInterval', () => {
  it('is 30s when any game is live', () => {
    expect(liveInterval([g('post'), g('in')], 300000)).toBe(30000);
  });
  it('is the idle interval otherwise', () => {
    expect(liveInterval([g('post'), g('pre')], 300000)).toBe(300000);
    expect(liveInterval(undefined, 300000)).toBe(300000);
    expect(liveInterval([g('post')], false)).toBe(false);
  });
});
