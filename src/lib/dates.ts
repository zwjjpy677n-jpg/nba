const TZ = 'Asia/Tokyo';
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const partsFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function jstParts(d: Date) {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFmt.formatToParts(d)) p[type] = value;
  return { y: +p.year, m: +p.month, d: +p.day, hh: +p.hour, mm: p.minute };
}

const pad = (n: number) => String(n).padStart(2, '0');

function parseDate(jstDate: string) {
  const [y, m, d] = jstDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIsoDate(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function todayJst(now: Date = new Date()): string {
  const p = jstParts(now);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

export function addDays(jstDate: string, n: number): string {
  const d = parseDate(jstDate);
  d.setUTCDate(d.getUTCDate() + n);
  return toIsoDate(d);
}

export function usDatesForJstDay(jstDate: string): [string, string] {
  const compact = (s: string) => s.replace(/-/g, '');
  return [compact(addDays(jstDate, -1)), compact(jstDate)];
}

export function jstDateOf(iso: string): string {
  return todayJst(new Date(iso));
}

export function formatJstDateTime(iso: string): string {
  const date = new Date(iso);
  const p = jstParts(date);
  const wd = WEEKDAYS[parseDate(todayJst(date)).getUTCDay()];
  return `${p.m}/${p.d}(${wd}) ${p.hh}:${p.mm}`;
}

export function formatJstTime(iso: string): string {
  const p = jstParts(new Date(iso));
  return `${p.hh}:${p.mm}`;
}

export function formatJstDateLabel(jstDate: string): string {
  const d = parseDate(jstDate);
  return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日(${WEEKDAYS[d.getUTCDay()]})`;
}
