import type { PlayerSeasonStats } from '../api/types';
import { fmtNum, fmtPct } from '../lib/format';

interface Side { name: string; stats: PlayerSeasonStats }

const ROWS: { key: keyof PlayerSeasonStats; label: string; pct?: boolean }[] = [
  { key: 'pts', label: '得点' },
  { key: 'reb', label: 'リバウンド' },
  { key: 'ast', label: 'アシスト' },
  { key: 'stl', label: 'スティール' },
  { key: 'blk', label: 'ブロック' },
  { key: 'fgPct', label: 'FG%', pct: true },
  { key: 'threePct', label: '3P%', pct: true },
  { key: 'ftPct', label: 'FT%', pct: true },
];

function width(v: number, max: number) {
  return max > 0 ? `${Math.round((v / max) * 100)}%` : '0%';
}

export default function CompareBars({ a, b }: { a: Side; b: Side }) {
  return (
    <div className="compare">
      <div className="compare-head">
        <span className="name-a">{a.name}</span>
        <span className="name-b">{b.name}</span>
      </div>
      {ROWS.map(({ key, label, pct }) => {
        const va = a.stats[key];
        const vb = b.stats[key];
        const max = Math.max(va ?? 0, vb ?? 0);
        const fmt = pct ? fmtPct : (v: number | null) => fmtNum(v);
        const lead = va !== null && vb !== null && va !== vb ? (va > vb ? 'a' : 'b') : null;
        return (
          <div key={key} className="cmp-row" data-testid={`cmp-${key}`}>
            <div className="cmp-label">{label}</div>
            <div className="cmp-bars">
              <div className={`cmp-side side-a ${lead === 'a' ? 'lead' : ''}`}>
                <span className="val-a">{fmt(va)}</span>
                <div className="track">{va !== null && <div className="bar-a" style={{ width: width(va, max) }} />}</div>
              </div>
              <div className={`cmp-side side-b ${lead === 'b' ? 'lead' : ''}`}>
                <div className="track">{vb !== null && <div className="bar-b" style={{ width: width(vb, max) }} />}</div>
                <span className="val-b">{fmt(vb)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
