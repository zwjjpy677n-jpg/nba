export default function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="stat-grid">
      {items.map((it) => (
        <div key={it.label} className="stat-cell">
          <dt>{it.label}</dt>
          <dd>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
