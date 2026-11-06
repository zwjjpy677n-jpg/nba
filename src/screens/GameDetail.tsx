import { useParams } from 'react-router-dom';
import { useGameDetail } from '../hooks/queries';
import type { BoxTeam, Game } from '../api/types';
import { formatJstDateTime } from '../lib/dates';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';
import TeamLogo from '../components/TeamLogo';

function Header({ game }: { game: Game }) {
  const periods = Math.max(game.home.linescores.length, game.away.linescores.length);
  const label = (i: number) => (i < 4 ? `${i + 1}Q` : `OT${i - 3 === 1 ? '' : i - 3}`);
  return (
    <div className="gd-header glass">
      <div className="gd-score">
        {[game.away, game.home].map((s) => (
          <div key={s.homeAway} className={`gd-side ${s.winner ? 'winner' : ''}`}>
            <TeamLogo src={s.team.logo} size={44} />
            <span>{s.team.shortName}</span>
            <strong className="gd-pts">{game.state === 'pre' ? '' : s.score ?? '—'}</strong>
          </div>
        ))}
      </div>
      <p className="muted center">
        {game.state === 'pre' ? `開始 ${formatJstDateTime(game.start)}` : game.state === 'post' ? (game.completed ? '終了' : game.statusText || '中止') : game.statusText}
      </p>
      {periods > 0 && (
        <div className="table-wrap">
          <table className="linescore">
            <thead>
              <tr>
                <th scope="col"></th>
                {Array.from({ length: periods }, (_, i) => <th key={i} scope="col">{label(i)}</th>)}
                <th scope="col">計</th>
              </tr>
            </thead>
            <tbody>
              {[game.away, game.home].map((s) => (
                <tr key={s.homeAway}>
                  <th scope="row">{s.team.abbr.toUpperCase()}</th>
                  {Array.from({ length: periods }, (_, i) => <td key={i}>{s.linescores[i] ?? '—'}</td>)}
                  <td><strong>{s.score ?? '—'}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BoxTable({ team }: { team: BoxTeam }) {
  return (
    <div className="box-block">
      <h2>{team.teamAbbr.toUpperCase()}</h2>
      <div className="table-wrap">
        <table className="box">
          <thead>
            <tr>
              <th scope="col" className="sticky">選手</th>
              {team.labels.map((l) => <th key={l} scope="col">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {team.players.map((p) => (
              <tr key={p.id} className={p.starter ? 'starter' : ''}>
                <th scope="row" className="sticky">{p.name}</th>
                {p.dnp || p.stats.length === 0 ? (
                  <td colSpan={team.labels.length} className="muted">出場なし</td>
                ) : (
                  team.labels.map((l, i) => <td key={l}>{p.stats[i] || '—'}</td>)
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GameDetail() {
  const { id = '' } = useParams();
  const q = useGameDetail(id);
  return (
    <section className="screen">
      <h1>試合詳細</h1>
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      {q.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : q.data ? (
        <>
          <Header game={q.data.game} />
          {q.data.box.length === 0 ? (
            <p className="empty">ボックススコアはまだありません</p>
          ) : (
            q.data.box.map((t) => <BoxTable key={t.teamAbbr} team={t} />)
          )}
        </>
      ) : (
        <ErrorState onRetry={() => q.refetch()} />
      )}
    </section>
  );
}
