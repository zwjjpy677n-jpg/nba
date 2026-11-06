import { render, screen } from '@testing-library/react';
import { fetchJson, getOldestCachedAt, resetCacheInfo } from '../../src/api/client';
import OfflineBanner from '../../src/components/OfflineBanner';

afterEach(() => { vi.unstubAllGlobals(); resetCacheInfo(); });

const respond = (body: Record<string, unknown>) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }));

describe('cache age tracking', () => {
  it('records nbaCachedAt from service-worker cached responses and strips it', async () => {
    const t = Date.now() - 10 * 60_000;
    vi.stubGlobal('fetch', respond({ a: 1, nbaCachedAt: t }));
    await expect(fetchJson('https://a')).resolves.toEqual({ a: 1 });
    expect(getOldestCachedAt()).toBe(t);
  });
  it('clears a URL once a fresh network response arrives', async () => {
    vi.stubGlobal('fetch', respond({ nbaCachedAt: Date.now() - 60_000 }));
    await fetchJson('https://a');
    vi.stubGlobal('fetch', respond({}));
    await fetchJson('https://a');
    expect(getOldestCachedAt()).toBeNull();
  });
  it('OfflineBanner shows the age of the oldest cached data', async () => {
    vi.stubGlobal('fetch', respond({ nbaCachedAt: Date.now() - 7 * 60_000 }));
    await fetchJson('https://a');
    render(<OfflineBanner />);
    expect(screen.getByText('7分前の情報')).toBeInTheDocument();
  });
  it('OfflineBanner renders nothing when data is fresh', () => {
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
