import { ageLabel } from './OfflineBanner';

export default function StaleBadge({ updatedAt, isError }: { updatedAt: number; isError: boolean }) {
  if (!isError || updatedAt <= 0) return null;
  return <span className="stale-badge">{ageLabel(updatedAt)}</span>;
}
