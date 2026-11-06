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
  try {
    return await res.json();
  } catch {
    throw new ApiError('parse', `invalid JSON: ${url}`);
  }
}
