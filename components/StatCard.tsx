interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="glass flex-1 p-4 text-center">
      <p
        className="font-mono text-2xl tabular-nums mb-1"
        style={{ color: 'var(--text)', opacity: 0.9 }}
      >
        {value}
        {unit && (
          <span
            className="text-sm ml-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {unit}
          </span>
        )}
      </p>
      <p
        className="text-[9px] uppercase tracking-wider"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
      >
        {label}
      </p>
    </div>
  );
}
