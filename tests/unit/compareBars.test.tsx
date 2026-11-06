import { render, screen } from '@testing-library/react';
import CompareBars from '../../src/components/CompareBars';
import type { PlayerSeasonStats } from '../../src/api/types';

const base: PlayerSeasonStats = { gp: 10, min: 30, pts: 30, reb: 5, ast: 5, stl: 1, blk: 1, fgPct: 50, threePct: 40, ftPct: 80 };

describe('CompareBars', () => {
  it('scales bars to the larger value', () => {
    render(<CompareBars a={{ name: 'A', stats: base }} b={{ name: 'B', stats: { ...base, pts: 15 } }} />);
    const row = screen.getByTestId('cmp-pts');
    expect((row.querySelector('.bar-a') as HTMLElement).style.width).toBe('100%');
    expect((row.querySelector('.bar-b') as HTMLElement).style.width).toBe('50%');
  });
  it('shows a dash and no bar for a missing value', () => {
    render(<CompareBars a={{ name: 'A', stats: base }} b={{ name: 'B', stats: { ...base, pts: null } }} />);
    const row = screen.getByTestId('cmp-pts');
    expect(row.querySelector('.bar-b')).toBeNull();
    expect(row.querySelector('.val-b')!.textContent).toBe('—');
  });
  it('renders 8 rows', () => {
    const { container } = render(<CompareBars a={{ name: 'A', stats: base }} b={{ name: 'B', stats: base }} />);
    expect(container.querySelectorAll('[data-testid^="cmp-"]')).toHaveLength(8);
  });
});
