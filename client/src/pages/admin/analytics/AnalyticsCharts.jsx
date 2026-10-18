const BarChart = ({ data = [], color = 'var(--color-primary)', height = 140, valueFormatter = (value) => value }) => {
  if (!data.length) return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>No data available.</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height, padding: '0.5rem 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{valueFormatter(d.value)}</span>
          <div title={d.detail || `${d.label}: ${valueFormatter(d.value)}`} style={{ width: '100%', background: color, borderRadius: '4px 4px 0 0', height: `${Math.max((d.value / max) * (height - 40), 4)}px`, transition: 'height 0.4s ease', cursor: 'help' }} />
          <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments = [], size = 120 }) => {
  const displayedTotal = segments.reduce((s, seg) => s + seg.value, 0);
  const total = displayedTotal || 1;
  let offset = 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-border)" strokeWidth="18" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const el = (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ + circ * 0.25}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            ><title>{`${seg.label}: ${seg.value}`}</title></circle>
          );
          offset += pct;
          return el;
        })}
        <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-text)">{displayedTotal}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {seg.label} — <strong style={{ color: 'var(--color-text)' }}>{Number(seg.value).toLocaleString('en-IN')}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem' }}>
    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '1rem' }}>{title}</h3>
    {children}
  </div>
);

export { BarChart, DonutChart, ChartCard };
export default { BarChart, DonutChart, ChartCard };