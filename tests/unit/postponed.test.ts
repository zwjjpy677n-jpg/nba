import post from '../fixtures/scoreboard-post.json';
import { parseScoreboard } from '../../src/api/scoreboard';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function postponed() {
  const data = clone(post) as any;
  const e = data.events[0];
  const type = { ...e.status.type, name: 'STATUS_POSTPONED', state: 'post', completed: false, shortDetail: 'Postponed' };
  e.status.type = type;
  if (e.competitions[0].status) e.competitions[0].status.type = type;
  for (const c of e.competitions[0].competitors) { c.score = '0'; delete c.winner; c.linescores = []; }
  return data;
}

describe('postponed games', () => {
  it('marks completed=true for normal finals', () => {
    expect(parseScoreboard(post)[0].completed).toBe(true);
  });
  it('marks postponed games as not completed with null winner', () => {
    const g = parseScoreboard(postponed())[0];
    expect(g.state).toBe('post');
    expect(g.completed).toBe(false);
    expect(g.statusText).toBe('Postponed');
    expect(g.home.winner).toBeNull();
  });
});
