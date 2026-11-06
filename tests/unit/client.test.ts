import { fetchJson, ApiError } from '../../src/api/client';

afterEach(() => vi.unstubAllGlobals());

describe('fetchJson', () => {
  it('returns parsed JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"a":1}', { status: 200 })));
    await expect(fetchJson('https://x')).resolves.toEqual({ a: 1 });
  });
  it('maps HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 404 })));
    await expect(fetchJson('https://x')).rejects.toMatchObject({ kind: 'http', status: 404 });
  });
  it('maps network errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    const err = await fetchJson('https://x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.kind).toBe('network');
  });
  it('maps invalid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 200 })));
    await expect(fetchJson('https://x')).rejects.toMatchObject({ kind: 'parse' });
  });
});
