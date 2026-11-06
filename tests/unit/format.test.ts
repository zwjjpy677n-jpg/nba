import { fmtNum, fmtPct, fmtText } from '../../src/lib/format';

describe('format', () => {
  it('null becomes em dash', () => {
    expect(fmtNum(null)).toBe('—');
    expect(fmtPct(null)).toBe('—');
    expect(fmtText(null)).toBe('—');
  });
  it('fmtNum rounds to one digit by default', () => {
    expect(fmtNum(33.333)).toBe('33.3');
    expect(fmtNum(9, 0)).toBe('9');
  });
  it('fmtPct appends percent', () => {
    expect(fmtPct(48.1)).toBe('48.1%');
  });
  it('fmtText passes strings', () => {
    expect(fmtText('W3')).toBe('W3');
  });
});
