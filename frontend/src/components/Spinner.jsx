export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="spinner-container" role="status">
      <div className="spinner" />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
}

export function SkeletonRows({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className="skeleton-cell" style={{ width: j === 0 ? '30%' : `${60 / cols}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-card skeleton-stat">
          <div className="skeleton-circle" />
          <div className="skeleton-text-group">
            <div className="skeleton-line short" />
            <div className="skeleton-line long" />
          </div>
        </div>
      ))}
    </div>
  );
}
