import type { TeamRef } from '../api/types';
import TeamLogo from './TeamLogo';

interface Props { teams: TeamRef[]; value: string; onChange: (abbr: string) => void }

export default function TeamPicker({ teams, value, onChange }: Props) {
  return (
    <ul className="team-picker">
      {teams.map((t) => (
        <li key={t.id}>
          <button type="button" aria-pressed={t.abbr === value} onClick={() => onChange(t.abbr)}>
            <TeamLogo src={t.logo} size={28} />
            <span>{t.name}</span>
            {t.abbr === value && <span className="check" aria-hidden="true">✓</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
