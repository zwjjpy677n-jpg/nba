export const ESPN_SITE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
export const ESPN_V2 = 'https://site.api.espn.com/apis/v2/sports/basketball/nba';
export const ESPN_WEB = 'https://site.web.api.espn.com/apis/common/v3';

export type ApiErrorKind = 'network' | 'http' | 'timeout' | 'parse';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

const cachedAtByUrl = new Map<string, number>();
const cacheListeners = new Set<() => void>();
let oldest: number | null = null;

function recompute() {
  const vals = [...cachedAtByUrl.values()];
  const next = vals.length ? Math.min(...vals) : null;
  if (next !== oldest) {
    oldest = next;
    cacheListeners.forEach((l) => l());
  }
}

/** Oldest save time of any ESPN response currently shown from the service-worker cache. */
export function getOldestCachedAt(): number | null {
  return oldest;
}

export function subscribeCacheInfo(cb: () => void): () => void {
  cacheListeners.add(cb);
  return () => cacheListeners.delete(cb);
}

export function resetCacheInfo(): void {
  cachedAtByUrl.clear();
  recompute();
}

export async function fetchJson(url: string, timeoutMs = 10000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, { signal: ctrl.signal });
  } catch (e) {
    if (ctrl.signal.aborted) throw new ApiError('timeout', `timeout: ${url}`);
    throw new ApiError('network', e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new ApiError('http', `HTTP ${res.status}: ${url}`, res.status);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ApiError('parse', `invalid JSON: ${url}`);
  }
  // The service worker adds nbaCachedAt when it serves a saved copy (offline / slow network).
  const marker = data !== null && typeof data === 'object' ? (data as Record<string, unknown>).nbaCachedAt : undefined;
  if (typeof marker === 'number' && marker > 0) {
    cachedAtByUrl.set(url, marker);
    delete (data as Record<string, unknown>).nbaCachedAt;
  } else {
    cachedAtByUrl.delete(url);
  }
  recompute();
  return data;
}
