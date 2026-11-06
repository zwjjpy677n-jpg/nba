import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGamesForDay, useStandings } from '../hooks/queries';
import { addDays, formatJstDateLabel, todayJst } from '../lib/dates';
import { useFavoriteTeam } from '../lib/settings';
import { conferenceMap, filterByConference, type ConfFilter } from '../lib/conference';
import ScoreCard from '../components/ScoreCard';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';
import Pills from '../components/Pills';
import { CalendarIcon } from '../components/Icons';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function Games() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('d');
  const day = raw && DATE_RE.test(raw) ? raw : todayJst();
  const q = useGamesForDay(day);
  const standings = useStandings();
  const [conf, setConf] = useState<ConfFilter>('all');
  const map = useMemo(() => conferenceMap(standings.data ?? []), [standings.data]);
  const go = (n: number) => setParams({ d: addDays(day, n) }, { replace: true });
  const [fav] = useFavoriteTeam();
  const games = q.data ? filterByConference(q.data, map, conf) : [];

  return (
    <section className="screen">
      <h1>試合</h1>
      <div className="date-nav">
        <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="前の日">‹</button>
        <h2><CalendarIcon /> {formatJstDateLabel(day)}</h2>
        <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="次の日">›</button>
      </div>
      <Pills
        label="カンファレンス"
        value={conf}
        onChange={setConf}
        options={[['all', 'すべて'], ['east', '東カンファレンス'], ['west', '西カンファレンス']]}
      />
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      {q.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : q.data ? (
        games.length === 0 ? (
          <p className="empty">この日の試合はありません</p>
        ) : (
          <div className="card-list">
            {games.map((g) => <ScoreCard key={g.id} game={g} highlightAbbr={fav} />)}
          </div>
        )
      ) : (
        <ErrorState onRetry={() => q.refetch()} />
      )}
    </section>
  );
}
