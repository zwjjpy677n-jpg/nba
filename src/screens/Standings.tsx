import { useState } from 'react';
import { useStandings } from '../hooks/queries';
import { useFavoriteTeam } from '../lib/settings';
import StandingsTable from '../components/StandingsTable';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';

type Conf = 'east' | 'west';

export default function Standings() {
  const q = useStandings();
  const [fav] = useFavoriteTeam();
  const [picked, setPicked] = useState<Conf | null>(null);
  const favConf = q.data?.find((r) => r.team.abbr === fav)?.conference ?? 'west';
  const conf = picked ?? favConf;

  return (
    <section className="screen">
      <h1>順位</h1>
      <div className="segmented" role="group" aria-label="カンファレンス">
        {(['east', 'west'] as const).map((c) => (
          <button key={c} type="button" aria-pressed={conf === c} onClick={() => setPicked(c)}>
            {c === 'east' ? '東' : '西'}
          </button>
        ))}
      </div>
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      {q.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : q.data ? (
        <StandingsTable rows={q.data.filter((r) => r.conference === conf)} highlightAbbr={fav} />
      ) : (
        <ErrorState onRetry={() => q.refetch()} />
      )}
    </section>
  );
}
