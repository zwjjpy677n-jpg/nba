import { getFavoriteTeam, setFavoriteTeam, TEAM_ABBRS } from '../../src/lib/settings';

describe('settings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('defaults to min', () => {
    expect(getFavoriteTeam()).toBe('min');
  });
  it('persists a chosen team', () => {
    setFavoriteTeam('lal');
    expect(getFavoriteTeam()).toBe('lal');
  });
  it('falls back to min for unknown abbreviation', () => {
    localStorage.setItem('nba.favoriteTeam', 'xxx');
    expect(getFavoriteTeam()).toBe('min');
  });
  it('survives localStorage throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
    expect(getFavoriteTeam()).toBe('min');
    expect(() => setFavoriteTeam('lal')).not.toThrow();
  });
  it('has 30 teams', () => {
    expect(TEAM_ABBRS).toHaveLength(30);
    expect(TEAM_ABBRS).toContain('min');
  });
});
