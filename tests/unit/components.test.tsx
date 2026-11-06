import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '../../src/components/ErrorState';
import StaleBadge from '../../src/components/StaleBadge';
import ScreenBoundary from '../../src/components/ScreenBoundary';

describe('ErrorState', () => {
  it('calls onRetry once when retry is pressed', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByText('読み込めませんでした')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '再試行' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('StaleBadge', () => {
  it('shows age when showing cached data after an error', () => {
    render(<StaleBadge updatedAt={Date.now() - 5 * 60_000} isError />);
    expect(screen.getByText('5分前の情報')).toBeInTheDocument();
  });
  it('shows "1分以内" for very fresh data', () => {
    render(<StaleBadge updatedAt={Date.now() - 10_000} isError />);
    expect(screen.getByText('1分以内の情報')).toBeInTheDocument();
  });
  it('renders nothing without an error', () => {
    const { container } = render(<StaleBadge updatedAt={Date.now() - 5 * 60_000} isError={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ScreenBoundary', () => {
  it('catches render errors and shows ErrorState', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Boom = () => { throw new Error('boom'); };
    render(<ScreenBoundary><Boom /></ScreenBoundary>);
    expect(screen.getByText('読み込めませんでした')).toBeInTheDocument();
    spy.mockRestore();
  });
});
