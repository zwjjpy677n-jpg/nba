import type { StandingRow } from '../api/types';
import { fmtText } from '../lib/format';
import TeamLogo from './TeamLogo';

interface Props { rows: StandingRow[]; highlightAbbr: string; compact?: boolean }

export default function StandingsTable({ rows, highlightAbbr, compact = false }: Props) {
  let shown = rows;
  if (compact) {
    const i = rows.findIndex((r) => r.team.abbr === highlightAbbr);
    shown = i < 0 ? rows.slice(0, 5) : rows.slice(Math.max(0, i - 2), i + 3);
  }
  return (
    <table className="standings">
      <thead>
        <tr>
          <th scope="col">順位</th>
          <th scope="col" className="left">チーム</th>
          <th scope="col">勝</th>
          <th scope="col">敗</th>
          <th scope="col">勝率</th>
          <th scope="col">差</th>
          <th scope="col">連続</th>
        </tr>
      </thead>
      <tbody>
        {shown.map((r) => {
          const fav = r.team.abbr === highlightAbbr;
          return (
            <tr key={r.team.id} className={fav ? 'fav' : ''} aria-current={fav ? 'true' : undefined}>
              <td>{r.seed ?? '—'}</td>
              <th scope="row" className="team-cell">
                <TeamLogo src={r.team.logo} size={20} />
                <span>{r.team.shortName}</span>
              </th>
              <td>{r.wins ?? '—'}</td>
              <td>{r.losses ?? '—'}</td>
              <td>{fmtText(r.winPct)}</td>
              <td>{fmtText(r.gamesBehind)}</td>
              <td>{fmtText(r.streak)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
