import { useTeams } from '../hooks/queries';
import { useFavoriteTeam } from '../lib/settings';
import TeamPicker from '../components/TeamPicker';
import ErrorState from '../components/ErrorState';

export default function Settings() {
  const [fav, setFav] = useFavoriteTeam();
  const teams = useTeams();
  return (
    <section className="screen">
      <h1>設定</h1>
      <h2 className="sub">推しチーム</h2>
      {teams.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : teams.data ? (
        <TeamPicker teams={teams.data} value={fav} onChange={setFav} />
      ) : (
        <ErrorState onRetry={() => teams.refetch()} />
      )}
      <p className="muted small credit">データ: ESPN</p>
    </section>
  );
}
