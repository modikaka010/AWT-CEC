import React, { useEffect, useState } from 'react';
import { getKnowledgeResources } from '../../../services/expertService';
import Pagination from '../../../components/admin/Pagination';

const TYPE_TABS = [
  { value: 'news',   label: '📰 Agricultural News' },
  { value: 'scheme', label: '🏛️ Government Schemes' },
];

const KnowledgeResources = () => {
  const [type, setType] = useState('news');
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getKnowledgeResources({ type, page, limit: 12 });
      setResources(res.data.data.resources || []);
      setPagination(res.data.data.pagination);
      setExpanded(null);
    } catch { setError('Failed to load resources.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [type]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>📚</span>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Knowledge Resources</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Agricultural news and government schemes</p>
        </div>
      </div>

      {/* Type toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--color-off-white)', borderRadius: 'var(--radius-lg)', padding: '0.25rem', width: 'fit-content', border: '1px solid var(--color-border)' }}>
        {TYPE_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setType(tab.value)} style={{
            padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: type === tab.value ? '#fff' : 'transparent',
            color: type === tab.value ? '#1565c0' : 'var(--color-text-muted)',
            boxShadow: type === tab.value ? 'var(--shadow-sm)' : 'none',
          }}>{tab.label}</button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No {type === 'news' ? 'articles' : 'schemes'} published yet.</p>
        </div>
      ) : type === 'news' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resources.map((item) => (
            <div key={item._id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', cursor: 'pointer', alignItems: 'flex-start' }}
                onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                {item.image && (
                  <img src={item.image} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#e8f0fe', color: '#1565c0', borderRadius: '9999px', padding: '0.15rem 0.5rem' }}>{item.category}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{fmtDate(item.publishedDate)}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0.4rem 0 0.3rem', color: 'var(--color-text)' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {item.summary || item.description?.slice(0, 120) + '…'}
                  </p>
                </div>
                <span style={{ fontSize: '0.9rem', flexShrink: 0, color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{expanded === item._id ? '▲' : '▼'}</span>
              </div>
              {expanded === item._id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, marginTop: '1rem', whiteSpace: 'pre-line' }}>{item.description}</p>
                  {item.source && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>Source: {item.source}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Schemes */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {resources.map((scheme) => (
            <div key={scheme._id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#e8f5e9', color: '#1a6b1a', borderRadius: '9999px', padding: '0.15rem 0.5rem' }}>{scheme.category}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.5rem', color: 'var(--color-text)', lineHeight: 1.4 }}>{scheme.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {scheme.description}
              </p>
              {scheme.eligibility && (
                <div style={{ background: 'var(--color-off-white)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', marginBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>Eligibility</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{scheme.eligibility}</p>
                </div>
              )}
              {scheme.officialLink && (
                <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Official Link →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default KnowledgeResources;
