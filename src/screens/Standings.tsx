import { useState } from 'react';
import { useStandings } from '../hooks/queries';
import { useFavoriteTeam } from '../lib/settings';
import StandingsTable from '../components/StandingsTable';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';
import Pills from '../components/Pills';

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
      <Pills label="カンファレンス" value={conf} onChange={setPicked} options={[['east', '東'], ['west', '西']]} />
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      {q.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : q.data ? (
        <div className="glass table-card"><StandingsTable rows={q.data.filter((r) => r.conference === conf)} highlightAbbr={fav} /></div>
      ) : (
        <ErrorState onRetry={() => q.refetch()} />
      )}
    </section>
  );
}
