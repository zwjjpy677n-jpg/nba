import { useState } from 'react';
import { usePlayerStats, useTeams, useTeamStats } from '../hooks/queries';
import { hasStats } from '../api/players';
import type { PlayerHit, PlayerSeasonStats, TeamSeasonStats } from '../api/types';
import { fmtNum, fmtPct } from '../lib/format';
import { useFavoriteTeam } from '../lib/settings';
import PlayerPicker from '../components/PlayerPicker';
import StatGrid from '../components/StatGrid';
import CompareBars from '../components/CompareBars';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';

type Mode = 'player' | 'compare' | 'team';

function playerItems(s: PlayerSeasonStats) {
  return [
    { label: '試合', value: fmtNum(s.gp, 0) },
    { label: '出場時間', value: fmtNum(s.min) },
    { label: '得点', value: fmtNum(s.pts) },
    { label: 'リバウンド', value: fmtNum(s.reb) },
    { label: 'アシスト', value: fmtNum(s.ast) },
    { label: 'スティール', value: fmtNum(s.stl) },
    { label: 'ブロック', value: fmtNum(s.blk) },
    { label: 'FG%', value: fmtPct(s.fgPct) },
    { label: '3P%', value: fmtPct(s.threePct) },
    { label: 'FT%', value: fmtPct(s.ftPct) },
  ];
}

function teamItems(s: TeamSeasonStats) {
  return [
    { label: '試合', value: fmtNum(s.gp, 0) },
    { label: '得点', value: fmtNum(s.pts) },
    { label: 'リバウンド', value: fmtNum(s.reb) },
    { label: 'アシスト', value: fmtNum(s.ast) },
    { label: 'スティール', value: fmtNum(s.stl) },
    { label: 'ブロック', value: fmtNum(s.blk) },
    { label: 'ターンオーバー', value: fmtNum(s.to) },
    { label: 'FG%', value: fmtPct(s.fgPct) },
    { label: '3P%', value: fmtPct(s.threePct) },
    { label: 'FT%', value: fmtPct(s.ftPct) },
  ];
}

function PlayerStatsView({ player }: { player: PlayerHit }) {
  const q = usePlayerStats(player.id);
  if (q.isPending) return <p className="muted">読み込み中…</p>;
  if (!q.data) return <ErrorState onRetry={() => q.refetch()} />;
  return (
    <div>
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      <h2 className="sub">{player.name}{player.teamName && <span className="muted small"> {player.teamName}</span>}</h2>
      {hasStats(q.data) ? <StatGrid items={playerItems(q.data)} /> : <p className="empty">今季の出場記録はありません</p>}
    </div>
  );
}

function PlayerMode() {
  const [p, setP] = useState<PlayerHit | null>(null);
  return (
    <>
      <PlayerPicker label="選手を検索" selected={p} onSelect={setP} />
      {p && <PlayerStatsView player={p} />}
    </>
  );
}

function CompareMode() {
  const [a, setA] = useState<PlayerHit | null>(null);
  const [b, setB] = useState<PlayerHit | null>(null);
  const qa = usePlayerStats(a?.id ?? null);
  const qb = usePlayerStats(b?.id ?? null);
  const failed = (a && qa.isError && !qa.data) || (b && qb.isError && !qb.data);
  return (
    <>
      <div className="compare-pickers">
        <PlayerPicker label="選手Aを検索" selected={a} onSelect={setA} />
        <PlayerPicker label="選手Bを検索" selected={b} onSelect={setB} />
      </div>
      {failed ? (
        <ErrorState onRetry={() => { void qa.refetch(); void qb.refetch(); }} />
      ) : a && b && qa.data && qb.data ? (
        <CompareBars a={{ name: a.name, stats: qa.data }} b={{ name: b.name, stats: qb.data }} />
      ) : a && b ? (
        <p className="muted">読み込み中…</p>
      ) : (
        <p className="muted">2人の選手を選んでください</p>
      )}
    </>
  );
}

function TeamMode() {
  const [fav] = useFavoriteTeam();
  const [abbr, setAbbr] = useState(fav);
  const teams = useTeams();
  const q = useTeamStats(abbr);
  return (
    <>
      <label className="field">
        <span>チーム</span>
        <select className="input" aria-label="チーム" value={abbr} onChange={(e) => setAbbr(e.target.value)}>
          {(teams.data ?? []).map((t) => (
            <option key={t.id} value={t.abbr}>{t.name}</option>
          ))}
          {!teams.data && <option value={abbr}>{abbr.toUpperCase()}</option>}
        </select>
      </label>
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      {q.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : q.data ? (
        <StatGrid items={teamItems(q.data)} />
      ) : (
        <ErrorState onRetry={() => q.refetch()} />
      )}
    </>
  );
}

export default function Stats() {
  const [mode, setMode] = useState<Mode>('player');
  const tabs: [Mode, string][] = [['player', '選手'], ['compare', '比較'], ['team', 'チーム']];
  return (
    <section className="screen">
      <h1>スタッツ</h1>
      <div className="segmented" role="group" aria-label="表示">
        {tabs.map(([m, label]) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{label}</button>
        ))}
      </div>
      {mode === 'player' && <PlayerMode />}
      {mode === 'compare' && <CompareMode />}
      {mode === 'team' && <TeamMode />}
    </section>
  );
}
