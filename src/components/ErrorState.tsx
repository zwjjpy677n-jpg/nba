export default function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-state" role="alert">
      <p>読み込めませんでした</p>
      <button type="button" className="btn" onClick={onRetry}>
        再試行
      </button>
    </div>
  );
}
