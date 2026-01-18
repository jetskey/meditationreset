interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="glass flex-1 p-4 text-center">
      <p
        className="text-2xl font-light mb-1"
        style={{ color: 'var(--text)' }}
      >
        {value}
        {unit && (
          <span
            className="text-sm ml-1"
            style={{ color: 'var(--muted)', opacity: 0.6 }}
          >
            {unit}
          </span>
        )}
      </p>
      <p
        className="text-[10px] uppercase tracking-wider"
        style={{ color: 'var(--muted)', opacity: 0.5, letterSpacing: '0.1em' }}
      >
        {label}
      </p>
    </div>
  );
}
