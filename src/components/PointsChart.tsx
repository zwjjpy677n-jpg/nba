import { useState } from 'react';
import type { GameLogPoint } from '../api/types';
import { formatJstDateTime } from '../lib/dates';

const W = 340;
const H = 150;
const PAD = { top: 16, right: 12, bottom: 22, left: 28 };

export default function PointsChart({ points }: { points: GameLogPoint[] }) {
  const [sel, setSel] = useState<number | null>(null);
  if (points.length === 0) return <p className="empty">今季の試合記録はまだありません</p>;

  const max = Math.max(10, ...points.map((p) => p.pts));
  const top = Math.ceil(max / 10) * 10;
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.top + ih - (v / top) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.pts).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const ticks = [0, top / 2, top];
  const avg = points.reduce((s, p) => s + p.pts, 0) / points.length;
  const slot = iw / Math.max(points.length, 1);
  const label = (p: GameLogPoint) => formatJstDateTime(p.date).split(' ')[0];
  const active = sel !== null ? points[sel] : null;

  return (
    <figure className="pts-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`今季の得点推移。${points.length}試合、平均${avg.toFixed(1)}点`}>
        <defs>
          <linearGradient id="ptsFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="tick" x={PAD.left - 6} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        <line className="avg" x1={PAD.left} x2={W - PAD.right} y1={y(avg)} y2={y(avg)} />
        <path className="area" d={area} fill="url(#ptsFill)" />
        <path className="line" d={line} />
        {active && sel !== null && (
          <line className="crosshair" x1={x(sel)} x2={x(sel)} y1={PAD.top} y2={y(0)} />
        )}
        {points.map((p, i) => (
          <circle key={p.eventId} data-testid="pt" className={sel === i ? 'pt on' : 'pt'} cx={x(i)} cy={y(p.pts)} r={sel === i ? 5.5 : 4} />
        ))}
        <text className="tick" x={x(0)} y={H - 6} textAnchor={points.length === 1 ? 'middle' : 'start'}>{label(points[0])}</text>
        {points.length > 1 && (
          <text className="tick" x={x(points.length - 1)} y={H - 6} textAnchor="end">{label(points[points.length - 1])}</text>
        )}
        {points.map((p, i) => (
          <rect
            key={p.eventId}
            data-testid="hit"
            className="hit"
            x={x(i) - slot / 2}
            y={0}
            width={slot}
            height={H}
            onClick={() => setSel(i)}
            onMouseEnter={() => setSel(i)}
          />
        ))}
      </svg>
      <figcaption className="chart-tip" role="status" aria-live="polite">
        {active ? (
          <>
            <span className="muted">{label(active)} vs {active.opponent ?? '—'}{active.result ? ` (${active.result})` : ''}</span>
            <strong>{active.pts}点</strong>
          </>
        ) : (
          <span className="muted">点をタップすると試合ごとの得点を表示 ・ 点線は平均 {avg.toFixed(1)}点</span>
        )}
      </figcaption>
      <table className="sr-only">
        <caption>今季の得点推移</caption>
        <thead><tr><th scope="col">日付</th><th scope="col">相手</th><th scope="col">得点</th></tr></thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.eventId}><td>{label(p)}</td><td>{p.opponent ?? '—'}</td><td>{p.pts}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
