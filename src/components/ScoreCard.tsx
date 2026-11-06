import { Link } from 'react-router-dom';
import type { Game, GameSide } from '../api/types';
import { formatJstTime } from '../lib/dates';
import TeamLogo from './TeamLogo';
import { ChevronRight } from './Icons';

function statusLabel(game: Game): string {
  if (game.state === 'pre') return `開始 ${formatJstTime(game.start)}`;
  if (game.state === 'post') return game.completed ? 'FINAL' : game.statusText || '中止';
  return game.statusText;
}

function Side({ side, highlight }: { side: GameSide; highlight: boolean }) {
  return (
    <div className={`sc-side ${highlight ? 'fav' : ''}`}>
      <TeamLogo src={side.team.logo} size={40} />
      <span className="sc-abbr">{side.team.abbr.toUpperCase()}</span>
    </div>
  );
}

export default function ScoreCard({ game, highlightAbbr }: { game: Game; highlightAbbr?: string }) {
  const { away, home } = game;
  const cls = (s: GameSide) => `score ${s.winner ? 'win' : ''}`;
  return (
    <Link
      to={`/games/${game.id}`}
      className={`score-card glass state-${game.state}`}
      aria-label={`${away.team.name} 対 ${home.team.name}`}
    >
      <Side side={away} highlight={away.team.abbr === highlightAbbr} />
      <div className="sc-center">
        {game.state === 'pre' ? (
          <span className="sc-time">{statusLabel(game)}</span>
        ) : (
          <>
            <div className="sc-scores">
              <span className={cls(away)}>{away.score ?? '—'}</span>
              <span className="sc-dash">-</span>
              <span className={cls(home)}>{home.score ?? '—'}</span>
            </div>
            <span className="sc-status">
              {game.state === 'in' && <span className="live-dot" aria-hidden="true" />}
              {statusLabel(game)}
            </span>
          </>
        )}
      </div>
      <Side side={home} highlight={home.team.abbr === highlightAbbr} />
      <span className="sc-chev"><ChevronRight /></span>
    </Link>
  );
}
