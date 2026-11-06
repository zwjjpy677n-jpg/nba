import { useSearchParams } from 'react-router-dom';
import { useGamesForDay } from '../hooks/queries';
import { addDays, formatJstDateLabel, todayJst } from '../lib/dates';
import { useFavoriteTeam } from '../lib/settings';
import ScoreCard from '../components/ScoreCard';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function Games() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('d');
  const day = raw && DATE_RE.test(raw) ? raw : todayJst();
  const q = useGamesForDay(day);
  const go = (n: number) => setParams({ d: addDays(day, n) }, { replace: true });
  const [fav] = useFavoriteTeam();

  return (
    <section className="screen">
      <h1>試合</h1>
      <div className="date-nav">
        <button type="button" className="btn" onClick={() => go(-1)} aria-label="前の日">‹</button>
        <h2>{formatJstDateLabel(day)}</h2>
        <button type="button" className="btn" onClick={() => go(1)} aria-label="次の日">›</button>
      </div>
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      {q.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : q.data ? (
        q.data.length === 0 ? (
          <p className="empty">この日の試合はありません</p>
        ) : (
          <div className="card-list">
            {q.data.map((g) => <ScoreCard key={g.id} game={g} highlightAbbr={fav} />)}
          </div>
        )
      ) : (
        <ErrorState onRetry={() => q.refetch()} />
      )}
    </section>
  );
}
