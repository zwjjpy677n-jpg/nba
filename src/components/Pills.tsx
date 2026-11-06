interface Props<T extends string> { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }

export default function Pills<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div className="pills" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
