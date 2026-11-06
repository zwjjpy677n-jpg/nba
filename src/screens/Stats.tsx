import { useState } from 'react';
import { useAthleteProfile, useGameLog, usePlayerStats, useTeams, useTeamStats } from '../hooks/queries';
import { hasStats } from '../api/players';
import type { PlayerHit, PlayerSeasonStats, TeamSeasonStats } from '../api/types';
import { fmtNum, fmtPct } from '../lib/format';
import { useFavoriteTeam } from '../lib/settings';
import PlayerPicker from '../components/PlayerPicker';
import StatGrid from '../components/StatGrid';
import CompareBars from '../components/CompareBars';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';
import Pills from '../components/Pills';
import PointsChart from '../components/PointsChart';

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

function PlayerCard({ player, stats }: { player: PlayerHit; stats: PlayerSeasonStats }) {
  const profile = useAthleteProfile(player.id).data;
  const meta = [
    profile?.jersey ? `#${profile.jersey}` : null,
    profile?.position,
    profile?.teamAbbr?.toUpperCase(),
  ].filter(Boolean).join('  ');
  return (
    <div className="player-card glass">
      {profile?.headshot ? (
        <img className="pc-photo" src={profile.headshot} alt="" crossOrigin="anonymous" />
      ) : (
        <span className="pc-photo ph" />
      )}
      <div className="pc-body">
        <h2>{player.name}</h2>
        <p className="muted">{meta || player.teamName || '—'}</p>
        <div className="pc-tiles">
          <div><b>{fmtNum(stats.pts)}</b><span>PPG</span></div>
          <div><b>{fmtNum(stats.reb)}</b><span>RPG</span></div>
          <div><b>{fmtNum(stats.ast)}</b><span>APG</span></div>
        </div>
      </div>
    </div>
  );
}

function PlayerStatsView({ player }: { player: PlayerHit }) {
  const q = usePlayerStats(player.id);
  const log = useGameLog(player.id);
  if (q.isPending) return <p className="muted">読み込み中…</p>;
  if (!q.data) return <ErrorState onRetry={() => q.refetch()} />;
  return (
    <div>
      <StaleBadge updatedAt={q.dataUpdatedAt} isError={q.isError} />
      <PlayerCard player={player} stats={q.data} />
      {hasStats(q.data) ? (
        <>
          <h2 className="section-title">今シーズン平均</h2>
          <StatGrid items={playerItems(q.data)} />
          <h2 className="section-title">試合ごとの得点</h2>
          <div className="glass chart-card">
            {log.isPending ? (
              <p className="muted">読み込み中…</p>
            ) : log.data ? (
              <PointsChart points={log.data} />
            ) : (
              <ErrorState onRetry={() => log.refetch()} />
            )}
          </div>
        </>
      ) : (
        <p className="empty">今季の出場記録はありません</p>
      )}
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
      <Pills label="表示" value={mode} onChange={setMode} options={tabs} />
      {mode === 'player' && <PlayerMode />}
      {mode === 'compare' && <CompareMode />}
      {mode === 'team' && <TeamMode />}
    </section>
  );
}
