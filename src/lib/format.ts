export const DASH = '—';

export function fmtNum(v: number | null, digits = 1): string {
  return v === null || !Number.isFinite(v) ? DASH : v.toFixed(digits);
}

export function fmtPct(v: number | null): string {
  return v === null || !Number.isFinite(v) ? DASH : `${v.toFixed(1)}%`;
}

export function fmtText(v: string | null): string {
  return v === null || v === '' ? DASH : v;
}
