import React from 'react';

/**
 * AdminTable — generic responsive table for admin pages.
 *
 * Props:
 *   columns   [{ key, label, render?, width? }]
 *   data      array of row objects
 *   loading   bool
 *   emptyText string
 *   keyField  string (default '_id')
 */
const AdminTable = ({ columns = [], data = [], loading = false, emptyText = 'No records found.', keyField = '_id' }) => {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
        <thead>
          <tr style={{ background: 'var(--color-off-white)', borderBottom: '2px solid var(--color-border)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  width: col.width || 'auto',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}>⏳</span>
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: idx % 2 === 0 ? '#fff' : 'var(--color-off-white)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : 'var(--color-off-white)')}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '0.75rem 1rem', verticalAlign: 'middle', color: 'var(--color-text)' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
