import React from 'react';

const Pagination = ({ page, pages, onPage }) => {
  if (!pages || pages <= 1) return null;

  const btnStyle = (active) => ({
    padding: '0.375rem 0.7rem',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: active ? 700 : 500,
    background: active ? 'var(--color-primary)' : '#fff',
    color: active ? '#fff' : 'var(--color-text-secondary)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
    minWidth: 36,
  });

  const pageNumbers = () => {
    const nums = [];
    const delta = 1;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      nums.push(i);
    }
    if (nums[0] > 1) { if (nums[0] > 2) nums.unshift('…'); nums.unshift(1); }
    if (nums[nums.length - 1] < pages) {
      if (nums[nums.length - 1] < pages - 1) nums.push('…');
      nums.push(pages);
    }
    return nums;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '1rem 0' }}>
      <button style={btnStyle(false)} disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
      {pageNumbers().map((n, i) =>
        n === '…' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: 'var(--color-text-muted)' }}>…</span>
        ) : (
          <button key={n} style={btnStyle(n === page)} onClick={() => onPage(n)}>{n}</button>
        )
      )}
      <button style={btnStyle(false)} disabled={page >= pages} onClick={() => onPage(page + 1)}>›</button>
    </div>
  );
};

export default Pagination;
