import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  useGamesForDay, useRoster, useRosterStats, useSchedule, useScoringLeaders, useStandings, useTeams,
} from '../hooks/queries';
import { hasStats } from '../api/players';
import type { Game, PlayerSeasonStats, RosterPlayer, StandingRow } from '../api/types';
import { formatJstDateTime, todayJst } from '../lib/dates';
import { fmtNum } from '../lib/format';
import { useFavoriteTeam } from '../lib/settings';
import ScoreCard from '../components/ScoreCard';
import StandingsTable from '../components/StandingsTable';
import ErrorState from '../components/ErrorState';
import StaleBadge from '../components/StaleBadge';
import TeamLogo from '../components/TeamLogo';
import { ChevronRight, FlameIcon, TrophyIcon } from '../components/Icons';

function Section({ title, icon, action, children }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="home-section">
      <div className="section-head">
        <h2 className="section-title">{icon}{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const sideOf = (g: Game, abbr: string) => (g.home.team.abbr === abbr ? g.home : g.away);
const oppOf = (g: Game, abbr: string) => (g.home.team.abbr === abbr ? g.away : g.home);

type Ranked = { p: RosterPlayer; s: PlayerSeasonStats };

function useTopPlayers(roster: RosterPlayer[]) {
  const results = useRosterStats(roster);
  const pending = results.some((r) => r.isPending);
  const allFailed = results.length > 0 && results.every((r) => r.isError);
  const rows: Ranked[] = roster
    .map((p, i) => ({ p, s: results[i]?.data }))
    .filter((x): x is Ranked => !!x.s && hasStats(x.s))
    .sort((a, b) => (b.s.pts ?? 0) - (a.s.pts ?? 0))
    .slice(0, 5);
  return { rows, pending, allFailed, retry: () => results.forEach((r) => r.refetch()) };
}

function Hero({ name, logo, color, standing, ace }: {
  name: string; logo: string | null; color: string | null; standing?: StandingRow; ace?: RosterPlayer;
}) {
  const style = { '--team': color ?? '#7c3aed' } as CSSProperties;
  const conf = standing?.conference === 'east' ? '東' : '西';
  return (
    <div className="hero" style={style}>
      {logo && <img className="hero-logo" src={logo} alt="" crossOrigin="anonymous" />}
      {ace?.headshot && <img className="hero-player" src={ace.headshot} alt="" crossOrigin="anonymous" />}
      <div className="hero-text">
        <span className="hero-kicker">MY TEAM</span>
        <h1>{name}</h1>
        {standing && (
          <p className="hero-record">
            <b>{standing.wins ?? '—'}-{standing.losses ?? '—'}</b>
            <span>{conf}{standing.seed ?? '—'}位</span>
            {standing.streak && <span>{standing.streak}</span>}
          </p>
        )}
        {ace && <p className="hero-ace">エース {ace.name}</p>}
      </div>
    </div>
  );
}

function NextGame({ game, abbr }: { game: Game; abbr: string }) {
  const me = sideOf(game, abbr);
  const opp = oppOf(game, abbr);
  return (
    <div className="next-game glass">
      <TeamLogo src={opp.team.logo} size={44} />
      <div>
        <div className="next-opp">{me.homeAway === 'home' ? 'vs' : '@'} {opp.team.name}</div>
        <div className="muted">{formatJstDateTime(game.start)}</div>
      </div>
    </div>
  );
}

function HotPlayers() {
  const q = useScoringLeaders();
  if (q.isPending) return <p className="muted">読み込み中…</p>;
  if (!q.data) return <ErrorState onRetry={() => q.refetch()} />;
  if (q.data.length === 0) return <p className="empty">ランキングはまだありません</p>;
  return (
    <ol className="hot-players">
      {q.data.map((l, i) => (
        <li key={l.id} className="glass">
          <span className={`rank r${i + 1}`}>{i + 1}</span>
          {l.headshot ? <img src={l.headshot} alt="" crossOrigin="anonymous" /> : <span className="hp-ph" />}
          <span className="hp-name">{l.shortName}</span>
          <span className="hp-ppg">{fmtNum(l.ppg)} PPG</span>
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
  const top = useTopPlayers(roster.data ?? []);

  const team = teams.data?.find((t) => t.abbr === abbr);
  const mine = (g: Game) => g.home.team.abbr === abbr || g.away.team.abbr === abbr;
  const todayGame = today.data?.find(mine);
  const games = schedule.data ?? [];
  const next = games.find((g) => g.state === 'pre');
  const recent = games.filter((g) => g.state === 'post' && g.completed).slice(-5).reverse();
  const standing = standings.data?.find((r) => r.team.abbr === abbr);
  const rosterHeadshot = (id: string) => roster.data?.find((p) => p.id === id);
  const ace = top.rows[0] ? rosterHeadshot(top.rows[0].p.id) : undefined;
  const seeAll = <Link to="/games" className="see-all">すべて見る <ChevronRight /></Link>;

  return (
    <section className="screen home">
      <Hero name={team?.name ?? abbr.toUpperCase()} logo={team?.logo ?? null} color={team?.color ?? null} standing={standing} ace={ace} />

      {todayGame && (
        <Section title="TODAY'S GAME" icon={<TrophyIcon />} action={seeAll}>
          <ScoreCard game={todayGame} highlightAbbr={abbr} />
        </Section>
      )}

      <Section title="次の試合" action={todayGame ? undefined : seeAll}>
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

      <Section title="HOT PLAYERS" icon={<FlameIcon />} action={<span className="muted small">リーグ得点ランキング</span>}>
        <HotPlayers />
      </Section>

      <Section title="直近5試合">
        {schedule.isPending ? (
          <p className="muted">読み込み中…</p>
        ) : !schedule.data ? (
          <ErrorState onRetry={() => schedule.refetch()} />
        ) : recent.length > 0 ? (
          <ul className="recent glass">
            {recent.map((g) => {
              const me = sideOf(g, abbr);
              const opp = oppOf(g, abbr);
              const wl = me.winner === true ? 'W' : me.winner === false ? 'L' : '—';
              return (
                <li key={g.id} className={wl === 'W' ? 'w' : wl === 'L' ? 'l' : ''}>
                  <span className="wl">{wl}</span>
                  <span className="recent-score">{me.score ?? '—'}-{opp.score ?? '—'}</span>
                  <span className="recent-opp">
                    <TeamLogo src={opp.team.logo} size={20} />
                    {me.homeAway === 'home' ? 'vs' : '@'} {opp.team.shortName}
                  </span>
                  <span className="muted small">{formatJstDateTime(g.start).split(' ')[0]}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty">今季の試合はまだありません</p>
        )}
      </Section>

      <Section title="順位" action={<Link to="/standings" className="see-all">全体 <ChevronRight /></Link>}>
        {standings.isPending ? (
          <p className="muted">読み込み中…</p>
        ) : standings.data ? (
          <div className="glass table-card">
            <StandingsTable rows={standings.data.filter((r) => r.conference === standing?.conference)} highlightAbbr={abbr} compact />
          </div>
        ) : (
          <ErrorState onRetry={() => standings.refetch()} />
        )}
      </Section>

      <Section title="主力選手">
        {roster.isPending || top.pending ? (
          <p className="muted">読み込み中…</p>
        ) : !roster.data ? (
          <ErrorState onRetry={() => roster.refetch()} />
        ) : top.rows.length === 0 ? (
          top.allFailed ? <ErrorState onRetry={top.retry} /> : <p className="empty">今季の成績はまだありません</p>
        ) : (
          <ol className="top-players glass">
            {top.rows.map(({ p, s }) => (
              <li key={p.id}>
                {p.headshot ? <img src={p.headshot} alt="" crossOrigin="anonymous" /> : <span className="tp-ph" />}
                <span className="tp-name">{p.name}</span>
                <span className="tp-stats">
                  <span><b>{fmtNum(s.pts)}</b> 点</span>
                  <span><b>{fmtNum(s.reb)}</b> リバ</span>
                  <span><b>{fmtNum(s.ast)}</b> アシ</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </section>
  );
}
