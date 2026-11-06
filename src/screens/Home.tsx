import type { ReactNode } from 'react';
import { useGamesForDay, useRoster, useRosterStats, useSchedule, useStandings, useTeams } from '../hooks/queries';
import { hasStats } from '../api/players';
import type { Game, PlayerSeasonStats, RosterPlayer } from '../api/types';
import { formatJstDateTime, todayJst } from '../lib/dates';
import { fmtNum } from '../lib/format';
import { useFavoriteTeam } from '../lib/settings';
import ScoreCard from '../components/ScoreCard';
import StandingsTable from '../components/StandingsTable';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';
import TeamLogo from '../components/TeamLogo';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="home-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const sideOf = (g: Game, abbr: string) => (g.home.team.abbr === abbr ? g.home : g.away);
const oppOf = (g: Game, abbr: string) => (g.home.team.abbr === abbr ? g.away : g.home);

function NextGame({ game, abbr }: { game: Game; abbr: string }) {
  const me = sideOf(game, abbr);
  const opp = oppOf(game, abbr);
  return (
    <div className="next-game">
      <TeamLogo src={opp.team.logo} size={40} />
      <div>
        <div className="next-opp">{me.homeAway === 'home' ? 'vs' : '@'} {opp.team.name}</div>
        <div className="muted">{formatJstDateTime(game.start)}</div>
      </div>
    </div>
  );
}

function Recent({ games, abbr }: { games: Game[]; abbr: string }) {
  return (
    <ul className="recent">
      {games.map((g) => {
        const me = sideOf(g, abbr);
        const opp = oppOf(g, abbr);
        const win = me.winner === true;
        return (
          <li key={g.id} className={win ? 'w' : 'l'}>
            <span className="wl">{win ? 'W' : 'L'}</span>
            <span className="recent-score">{me.score ?? '—'}-{opp.score ?? '—'}</span>
            <span className="recent-opp">{me.homeAway === 'home' ? 'vs' : '@'} {opp.team.shortName}</span>
            <span className="muted small">{formatJstDateTime(g.start).split(' ')[0]}</span>
          </li>
        );
      })}
    </ul>
  );
}

function TopPlayers({ roster }: { roster: RosterPlayer[] }) {
  const results = useRosterStats(roster);
  if (results.some((r) => r.isPending)) return <p className="muted">読み込み中…</p>;
  const rows = roster
    .map((p, i) => ({ p, s: results[i].data }))
    .filter((x): x is { p: RosterPlayer; s: PlayerSeasonStats } => !!x.s && hasStats(x.s))
    .sort((a, b) => (b.s.pts ?? 0) - (a.s.pts ?? 0))
    .slice(0, 5);
  if (rows.length === 0) {
    return results.every((r) => r.isError)
      ? <ErrorState onRetry={() => results.forEach((r) => r.refetch())} />
      : <p className="empty">今季の成績はまだありません</p>;
  }
  return (
    <ol className="top-players">
      {rows.map(({ p, s }) => (
        <li key={p.id}>
          <span className="tp-name">{p.name}</span>
          <span className="tp-stats">
            <span><b>{fmtNum(s.pts)}</b> 点</span>
            <span><b>{fmtNum(s.reb)}</b> リバ</span>
            <span><b>{fmtNum(s.ast)}</b> アシ</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function Home() {
  const [abbr] = useFavoriteTeam();
  const teams = useTeams();
  const schedule = useSchedule(abbr);
  const today = useGamesForDay(todayJst());
  const standings = useStandings();
  const roster = useRoster(abbr);

  const team = teams.data?.find((t) => t.abbr === abbr);
  const live = today.data?.find((g) => g.state === 'in' && (g.home.team.abbr === abbr || g.away.team.abbr === abbr));
  const games = schedule.data ?? [];
  const next = games.find((g) => g.state === 'pre');
  const recent = games.filter((g) => g.state === 'post').slice(-5).reverse();
  const conf = standings.data?.find((r) => r.team.abbr === abbr)?.conference;

  return (
    <section className="screen">
      <div className="home-title">
        <TeamLogo src={team?.logo ?? null} size={40} />
        <h1>{team?.name ?? abbr.toUpperCase()}</h1>
      </div>

      {live && (
        <Section title="試合中">
          <ScoreCard game={live} highlightAbbr={abbr} />
        </Section>
      )}

      <Section title="次の試合">
        <StaleBadge updatedAt={schedule.dataUpdatedAt} isError={schedule.isError} />
        {schedule.isPending ? (
          <p className="muted">読み込み中…</p>
        ) : !schedule.data ? (
          <ErrorState onRetry={() => schedule.refetch()} />
        ) : next ? (
          <NextGame game={next} abbr={abbr} />
        ) : (
          <p className="empty">予定されている試合はありません</p>
        )}
      </Section>

      <Section title="直近5試合">
        {schedule.isPending ? (
          <p className="muted">読み込み中…</p>
        ) : !schedule.data ? (
          <ErrorState onRetry={() => schedule.refetch()} />
        ) : recent.length > 0 ? (
          <Recent games={recent} abbr={abbr} />
        ) : (
          <p className="empty">今季の試合はまだありません</p>
        )}
      </Section>

      <Section title="順位">
        {standings.isPending ? (
          <p className="muted">読み込み中…</p>
        ) : standings.data ? (
          <StandingsTable rows={standings.data.filter((r) => r.conference === conf)} highlightAbbr={abbr} compact />
        ) : (
          <ErrorState onRetry={() => standings.refetch()} />
        )}
      </Section>

      <Section title="主力選手">
        {roster.isPending ? (
          <p className="muted">読み込み中…</p>
        ) : roster.data ? (
          <TopPlayers roster={roster.data} />
        ) : (
          <ErrorState onRetry={() => roster.refetch()} />
        )}
      </Section>
    </section>
  );
}
