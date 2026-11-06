import { useSyncExternalStore } from 'react';
import { getOldestCachedAt, subscribeCacheInfo } from '../api/client';

export function ageLabel(updatedAt: number, now: number = Date.now()): string {
  const minutes = Math.floor((now - updatedAt) / 60_000);
  if (minutes < 1) return '1分以内の情報';
  if (minutes < 60 * 24) return `${minutes}分前の情報`;
  return `${Math.floor(minutes / (60 * 24))}日前の情報`;
}

/** Shown while any data on screen came from the offline cache. */
export default function OfflineBanner() {
  const cachedAt = useSyncExternalStore(subscribeCacheInfo, getOldestCachedAt, () => null);
  if (cachedAt === null) return null;
  return (
    <div className="offline-banner" role="status">
      <span>{ageLabel(cachedAt)}</span>
      <span className="muted small">オフラインのため保存済みのデータを表示中</span>
    </div>
  );
}
