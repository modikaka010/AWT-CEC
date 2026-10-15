import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNegotiationById, sendCounterOffer, acceptNegotiation, rejectNegotiation } from '../../../services/farmerService';
import { useAuth } from '../../../hooks/useAuth';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

const ACCENT = '#1a6b1a';

const NegotiationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [counterForm, setCounterForm] = useState({ offerPrice:'', quantity:'', message:'' });
  const [showCounter, setShowCounter] = useState(false);
  const [counterError, setCounterError] = useState('');
  const [modal, setModal] = useState({ open:false, action:'' });
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getNegotiationById(id);
      const n = res.data.data.negotiation;
      setNegotiation(n);
      setCounterForm((f) => ({ ...f, quantity: n.currentQuantity, offerPrice: '' }));
    } catch (e) { setError(e.response?.data?.message || 'Not found.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const act = async (fn, successText) => {
    setActionLoading(true);
    try {
      await fn();
      setSuccessMsg(successText);
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch (e) { setError(e.response?.data?.message || 'Action failed.'); }
    finally { setActionLoading(false); setModal({ open:false, action:'' }); }
  };

  const handleCounter = async (e) => {
    e.preventDefault();
    setCounterError('');
    if (!counterForm.offerPrice || parseFloat(counterForm.offerPrice) <= 0) { setCounterError('Enter a valid price.'); return; }
    await act(
      () => sendCounterOffer(id, { offerPrice: parseFloat(counterForm.offerPrice), quantity: parseInt(counterForm.quantity)||negotiation.currentQuantity, message: counterForm.message }),
      'Counter offer sent to buyer.'
    );
    setShowCounter(false);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
  const fmtCurrency = (n) => n != null ? `₹${n.toLocaleString('en-IN')}` : '—';

  if (loading) return <div style={{ padding:'2rem', textAlign:'center', color:'var(--color-text-muted)' }}>Loading…</div>;
  if (!negotiation) return <div className="alert alert-error">{error || 'Not found.'}</div>;

  const isActive = ['pending', 'countered'].includes(negotiation.status);

  return (
    <div style={{ maxWidth:700 }}>
      <button onClick={() => navigate('/farmer/negotiations')} style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:ACCENT, fontWeight:600, fontSize:'0.85rem', background:'none', border:'none', cursor:'pointer', marginBottom:'1.25rem' }}>
        ← Back to Negotiations
      </button>

      {successMsg && <div className="alert alert-success" style={{ marginBottom:'1rem' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

      {/* Header */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ fontWeight:800, fontSize:'1.15rem', margin:0 }}>🌾 {negotiation.productName}</h2>
            <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', margin:'0.25rem 0 0' }}>
              Buyer: {negotiation.buyer?.name} · Listed: {fmtCurrency(negotiation.listedPrice)} {negotiation.priceUnit}
            </p>
          </div>
          <StatusBadge status={negotiation.status} size="md" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginTop:'1rem', padding:'1rem', background:'var(--color-off-white)', borderRadius:'var(--radius-md)' }}>
          {[['Listed Price', fmtCurrency(negotiation.listedPrice)], ['Buyer\'s Offer', fmtCurrency(negotiation.currentPrice)], ['Quantity', negotiation.currentQuantity]].map(([l,v]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <p style={{ fontSize:'0.68rem', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 0.2rem' }}>{l}</p>
              <p style={{ fontWeight:800, fontSize:'1rem', color: l.includes('Offer') ? ACCENT : 'var(--color-text)', margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
        {negotiation.status === 'accepted' && (
          <div style={{ marginTop:'1rem', padding:'0.875rem 1rem', background:'#edf7ed', border:'1px solid #b2dfb2', borderRadius:'var(--radius-md)' }}>
            <p style={{ fontWeight:700, color:ACCENT, fontSize:'0.875rem', margin:0 }}>
              ✅ Agreed: {fmtCurrency(negotiation.agreedPrice)} {negotiation.priceUnit} × {negotiation.agreedQuantity} units
            </p>
          </div>
        )}
      </div>

      {/* Offer history */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', marginBottom:'1.25rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 1rem' }}>💬 Offer History</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {negotiation.offers?.map((offer, i) => (
            <div key={i} style={{ display:'flex', gap:'0.75rem', justifyContent: offer.by === 'farmer' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth:'70%', padding:'0.875rem 1rem', borderRadius:'var(--radius-lg)',
                background: offer.by === 'farmer' ? '#edf7ed' : 'var(--color-off-white)',
                border:`1px solid ${offer.by === 'farmer' ? ACCENT : 'var(--color-border)'}`,
              }}>
                <p style={{ fontWeight:700, fontSize:'0.8rem', margin:'0 0 0.25rem', color: offer.by === 'farmer' ? ACCENT : 'var(--color-text-secondary)' }}>
                  {offer.by === 'farmer' ? 'Your Counter Offer' : 'Buyer\'s Offer'}
                </p>
                <p style={{ fontWeight:800, fontSize:'1rem', color:'var(--color-text)', margin:'0 0 0.2rem' }}>
                  {fmtCurrency(offer.price)} {negotiation.priceUnit} × {offer.quantity}
                </p>
                {offer.message && <p style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)', margin:'0.2rem 0 0', lineHeight:1.5 }}>{offer.message}</p>}
                <p style={{ fontSize:'0.68rem', color:'var(--color-text-muted)', margin:'0.375rem 0 0' }}>{fmtDate(offer.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer info */}
      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem', marginBottom:'1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <p style={{ fontWeight:700, fontSize:'0.875rem', margin:0 }}>🧑‍💼 {negotiation.buyer?.name}</p>
          <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', margin:0 }}>{negotiation.buyer?.email} · {negotiation.buyer?.mobile}</p>
        </div>
        <button onClick={() => navigate(`/farmer/chat/${negotiation.buyer?._id}`)} className="btn btn-sm" style={{ background:ACCENT, color:'#fff', borderColor:ACCENT }}>
          💬 Chat with Buyer
        </button>
      </div>

      {/* Actions */}
      {isActive && (
        <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', padding:'1.25rem', display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
          <button onClick={() => setModal({ open:true, action:'accept' })} className="btn btn-sm" style={{ background:ACCENT, color:'#fff', borderColor:ACCENT }}>
            ✅ Accept Offer
          </button>
          <button onClick={() => { setShowCounter((s) => !s); setCounterError(''); }} className="btn btn-sm" style={{ background:'#fef9ec', color:'#d4850a', border:'1px solid #d4850a' }}>
            🔄 Counter Offer
          </button>
          <button onClick={() => setModal({ open:true, action:'reject' })} className="btn btn-sm" style={{ background:'var(--color-error-bg)', color:'var(--color-error)', border:'1px solid #f5c6c3' }}>
            ❌ Reject
          </button>
        </div>
      )}

      {/* Counter form */}
      {showCounter && isActive && (
        <div style={{ background:'#fff', border:`2px solid ${ACCENT}`, borderRadius:'var(--radius-xl)', padding:'1.5rem', marginTop:'1.25rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'1rem', color:ACCENT, margin:'0 0 1rem' }}>🔄 Send Counter Offer</h3>
          {counterError && <div className="alert alert-error" style={{ marginBottom:'0.875rem' }}>{counterError}</div>}
          <form onSubmit={handleCounter}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Your Price (₹) *</label>
                <input className="form-input" type="number" step="0.01" min="1" value={counterForm.offerPrice} onChange={(e) => setCounterForm((f) => ({ ...f, offerPrice:e.target.value }))} placeholder={`e.g. ${negotiation.listedPrice}`} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="1" value={counterForm.quantity} onChange={(e) => setCounterForm((f) => ({ ...f, quantity:e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop:'1rem' }}>
              <label className="form-label">Message (optional)</label>
              <textarea className="form-input" rows={2} value={counterForm.message} onChange={(e) => setCounterForm((f) => ({ ...f, message:e.target.value }))} placeholder="Explain your price…" style={{ resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:'0.625rem' }}>
              <button type="submit" disabled={actionLoading} className="btn btn-sm" style={{ background:ACCENT, color:'#fff', borderColor:ACCENT, minWidth:130 }}>
                {actionLoading ? 'Sending…' : 'Send Counter'}
              </button>
              <button type="button" onClick={() => setShowCounter(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={modal.open}
        title={modal.action === 'accept' ? 'Accept Buyer\'s Offer' : 'Reject Negotiation'}
        message={modal.action === 'accept'
          ? `Accept buyer's offer of ${fmtCurrency(negotiation.currentPrice)} for ${negotiation.currentQuantity} units?`
          : 'Reject this buyer\'s negotiation?'}
        confirmLabel={modal.action === 'accept' ? 'Accept' : 'Reject'}
        danger={modal.action === 'reject'}
        onConfirm={() => {
          if (modal.action === 'accept') act(() => acceptNegotiation(id), 'Offer accepted!');
          else act(() => rejectNegotiation(id, { reason: rejectReason.trim() }), 'Negotiation rejected.');
        }}
        onCancel={() => { setModal({ open:false, action:'' }); setRejectReason(''); }}
        loading={actionLoading}
      >
        {modal.action === 'reject' && (
          <div style={{ marginTop:'0.5rem' }}>
            <label style={{ fontSize:'0.8rem', fontWeight:600, display:'block', marginBottom:'0.4rem' }}>Reason (optional)</label>
            <textarea className="form-input" rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={{ resize:'vertical' }} />
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default NegotiationDetail;
