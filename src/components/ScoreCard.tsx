import { Link } from 'react-router-dom';
import type { Game, GameSide } from '../api/types';
import { formatJstTime } from '../lib/dates';
import TeamLogo from './TeamLogo';

function statusLabel(game: Game): string {
  if (game.state === 'pre') return `開始 ${formatJstTime(game.start)}`;
  if (game.state === 'post') return game.completed ? '終了' : game.statusText || '中止';
  return game.statusText;
}

function Row({ side, state, highlight }: { side: GameSide; state: Game['state']; highlight: boolean }) {
  const cls = ['sc-row', side.winner ? 'winner' : '', highlight ? 'fav' : ''].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <TeamLogo src={side.team.logo} />
      <span className="sc-name">{side.team.shortName}</span>
      {side.record && state === 'pre' && <span className="sc-record">{side.record}</span>}
      {state !== 'pre' && <span className="score">{side.score ?? '—'}</span>}
    </div>
  );
}

export default function ScoreCard({ game, highlightAbbr }: { game: Game; highlightAbbr?: string }) {
  return (
    <Link to={`/games/${game.id}`} className={`score-card state-${game.state}`}>
      <div className="sc-teams">
        <Row side={game.away} state={game.state} highlight={game.away.team.abbr === highlightAbbr} />
        <Row side={game.home} state={game.state} highlight={game.home.team.abbr === highlightAbbr} />
      </div>
      <div className="sc-status">
        {game.state === 'in' && <span className="live-dot" aria-hidden="true" />}
        {statusLabel(game)}
      </div>
    </Link>
  );
}
