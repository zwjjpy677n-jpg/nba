import { render, screen, fireEvent } from '@testing-library/react';
import PointsChart from '../../src/components/PointsChart';
import type { GameLogPoint } from '../../src/api/types';

const pts: GameLogPoint[] = [
  { eventId: '1', date: '2026-10-22T23:00:00Z', pts: 30, opponent: 'CLE', result: 'W' },
  { eventId: '2', date: '2026-10-24T23:00:00Z', pts: 12, opponent: 'BOS', result: 'L' },
  { eventId: '3', date: '2026-10-26T23:00:00Z', pts: 45, opponent: 'LAL', result: 'W' },
];

describe('PointsChart', () => {
  it('draws one marker per game and a line', () => {
    const { container } = render(<PointsChart points={pts} />);
    expect(container.querySelectorAll('[data-testid="pt"]')).toHaveLength(3);
    expect(container.querySelector('path.line')).not.toBeNull();
  });
  it('shows a tooltip with date, opponent and points when a game is selected', () => {
    render(<PointsChart points={pts} />);
    fireEvent.click(screen.getAllByTestId('hit')[2]);
    expect(screen.getByRole('status')).toHaveTextContent('vs LAL');
    expect(screen.getByRole('status')).toHaveTextContent('45点');
  });
  it('has an accessible table of the values', () => {
    render(<PointsChart points={pts} />);
    expect(screen.getByRole('table', { hidden: true })).toHaveTextContent('45');
  });
  it('renders an empty message without games', () => {
    render(<PointsChart points={[]} />);
    expect(screen.getByText('今季の試合記録はまだありません')).toBeInTheDocument();
  });
});
