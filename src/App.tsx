import { NavLink, Route, Routes, Link, useLocation } from 'react-router-dom';
import ScreenBoundary from './components/ScreenBoundary';
import OfflineBanner from './components/OfflineBanner';
import { BallIcon, BarsIcon, GearIcon, HomeIcon, SearchIcon } from './components/Icons';
import Home from './screens/Home';
import Games from './screens/Games';
import GameDetail from './screens/GameDetail';
import Standings from './screens/Standings';
import Stats from './screens/Stats';
import Settings from './screens/Settings';

const TABS = [
  { to: '/', label: 'ホーム', Icon: HomeIcon, end: true },
  { to: '/games', label: '試合', Icon: BallIcon, end: false },
  { to: '/standings', label: '順位', Icon: BarsIcon, end: false },
  { to: '/stats', label: 'スタッツ', Icon: SearchIcon, end: false },
];

export default function App() {
  const location = useLocation();
  return (
    <div className="app">
      <div className="arena" aria-hidden="true" />
      <header className="topbar">
        <span className="brand">NBA</span>
        <Link to="/settings" className="icon-btn" aria-label="設定">
          <GearIcon />
        </Link>
      </header>
      <main className="content">
        <OfflineBanner />
        <ScreenBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ScreenBoundary>
      </main>
      <nav className="tabbar">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="tab">
            <span className="tab-icon"><Icon /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
