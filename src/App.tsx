import { NavLink, Route, Routes, Link } from 'react-router-dom';
import Home from './screens/Home';
import Games from './screens/Games';
import GameDetail from './screens/GameDetail';
import Standings from './screens/Standings';
import Stats from './screens/Stats';
import Settings from './screens/Settings';

const TABS = [
  { to: '/', label: 'ホーム', icon: '🏠', end: true },
  { to: '/games', label: '試合', icon: '🏀', end: false },
  { to: '/standings', label: '順位', icon: '📊', end: false },
  { to: '/stats', label: 'スタッツ', icon: '🔍', end: false },
];

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">NBA</span>
        <Link to="/settings" className="settings-link" aria-label="設定">
          ⚙
        </Link>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className="tab">
            <span className="tab-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
