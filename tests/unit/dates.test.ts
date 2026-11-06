import { usDatesForJstDay, jstDateOf, todayJst, addDays, formatJstDateTime, formatJstDateLabel } from '../../src/lib/dates';

describe('dates', () => {
  it('usDatesForJstDay returns US previous day and same day', () => {
    expect(usDatesForJstDay('2026-11-06')).toEqual(['20261105', '20261106']);
  });
  it('jstDateOf converts UTC ISO to JST date across midnight', () => {
    expect(jstDateOf('2026-11-06T00:00Z')).toBe('2026-11-06');
    expect(jstDateOf('2026-11-05T14:59Z')).toBe('2026-11-05');
    expect(jstDateOf('2026-11-05T15:00Z')).toBe('2026-11-06');
  });
  it('todayJst uses Tokyo time', () => {
    expect(todayJst(new Date('2026-11-05T15:30:00Z'))).toBe('2026-11-06');
  });
  it('addDays crosses year end', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('formatJstDateTime', () => {
    expect(formatJstDateTime('2026-11-06T00:00Z')).toBe('11/6(金) 9:00');
  });
  it('formatJstDateLabel', () => {
    expect(formatJstDateLabel('2026-11-06')).toBe('11月6日(金)');
  });
});
