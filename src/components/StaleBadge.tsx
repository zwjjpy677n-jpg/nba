export default function StaleBadge({ updatedAt, isError }: { updatedAt: number; isError: boolean }) {
  if (!isError || updatedAt <= 0) return null;
  const minutes = Math.floor((Date.now() - updatedAt) / 60_000);
  const label = minutes < 1 ? '1分以内の情報' : `${minutes}分前の情報`;
  return <span className="stale-badge">{label}</span>;
}
