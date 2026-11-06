import { useEffect, useId, useState } from 'react';
import { usePlayerSearch } from '../hooks/queries';
import type { PlayerHit } from '../api/types';
import ErrorState from './ErrorState';

interface Props { label: string; selected: PlayerHit | null; onSelect: (p: PlayerHit | null) => void }

export default function PlayerPicker({ label, selected, onSelect }: Props) {
  const id = useId();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQuery(text), 300);
    return () => clearTimeout(t);
  }, [text]);
  const q = usePlayerSearch(query);

  if (selected) {
    return (
      <div className="picked">
        <span>{selected.name}</span>
        <button type="button" className="btn small" onClick={() => onSelect(null)}>変更</button>
      </div>
    );
  }

  const ready = query.trim().length >= 2;
  return (
    <div className="picker">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        type="search"
        className="input"
        placeholder="選手名（英語）"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
      />
      {ready && (
        q.isPending ? (
          <p className="muted">検索中…</p>
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : q.data.length === 0 ? (
          <p className="empty">該当する選手がいません</p>
        ) : (
          <ul className="hits">
            {q.data.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => { onSelect(p); setText(''); setQuery(''); }}>
                  <span>{p.name}</span>
                  {p.teamName && <span className="muted small">{p.teamName}</span>}
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
