import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNews, getNewsById, updateNews } from '../../../services/adminService';

const NEWS_CATEGORIES = [
  'Crop Science', 'Market Prices', 'Government Policy',
  'Technology', 'Weather', 'Organic Farming', 'Livestock', 'General',
];

const INITIAL = {
  title: '', category: 'General', description: '', summary: '',
  image: '', source: 'Avelia', sourceUrl: '', publishedDate: '', status: 'draft',
};

const NewsForm = () => {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await getNewsById(id);
        const n = res.data.data.news;
        setForm({
          title: n.title || '',
          category: n.category || 'General',
          description: n.description || '',
          summary: n.summary || '',
          image: n.image || '',
          source: n.source || 'Avelia',
          sourceUrl: n.sourceUrl || '',
          publishedDate: n.publishedDate ? n.publishedDate.slice(0, 10) : '',
          status: n.status || 'draft',
        });
      } catch { setError('Failed to load article.'); }
      finally { setFetching(false); }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category || !form.description.trim()) {
      setError('Title, category, and description are required.');
      return;
    }
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await updateNews(id, form);
        setSuccessMsg('Article updated successfully.');
      } else {
        await createNews(form);
        setSuccessMsg('Article created successfully.');
        setForm(INITIAL);
      }
      setTimeout(() => { setSuccessMsg(''); navigate('/admin/content/news'); }, 1500);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save article.');
    } finally { setLoading(false); }
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={() => navigate('/admin/content/news')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}>
        ← Back to News
      </button>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 1.5rem', color: 'var(--color-text)' }}>
          {isEdit ? '✏️ Edit Article' : '📰 Add News Article'}
        </h2>

        {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label className="form-label">Title <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Article title" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Summary <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(short excerpt)</span></label>
            <textarea className="form-input" name="summary" rows={2} value={form.summary} onChange={handleChange} placeholder="Brief summary shown in listings…" style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Description <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <textarea className="form-input" name="description" rows={8} value={form.description} onChange={handleChange} placeholder="Full article content…" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Source</label>
              <input className="form-input" name="source" value={form.source} onChange={handleChange} placeholder="e.g. ICAR, PIB, Avelia" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Source URL</label>
              <input className="form-input" name="sourceUrl" value={form.sourceUrl} onChange={handleChange} placeholder="https://…" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Image URL</label>
              <input className="form-input" name="image" value={form.image} onChange={handleChange} placeholder="https://… or /uploads/…" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Published Date</label>
              <input className="form-input" type="date" name="publishedDate" value={form.publishedDate} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: 130 }}>
              {loading ? 'Saving…' : isEdit ? 'Update Article' : 'Create Article'}
            </button>
            <button type="button" onClick={() => navigate('/admin/content/news')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;
