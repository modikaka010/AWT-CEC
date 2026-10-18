import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnalytics } from '../../../services/adminService';
import StatsCard from '../../../components/admin/StatsCard';
import { BarChart, DonutChart, ChartCard } from './AnalyticsCharts';

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const sumValues = (stats = {}) => Object.values(stats).reduce((sum, value) => sum + Number(value || 0), 0);
const COLORS = {
  farmer: '#1a6b1a',
  buyer: '#1565c0',
  expert: '#e65100',
  admin: '#7c3aed',
};

const Analytics = () => {
  const initialTo = toDateInput(new Date());
  const initialFromDate = new Date();
  initialFromDate.setDate(initialFromDate.getDate() - 29);

  const [fromInput, setFromInput] = useState(toDateInput(initialFromDate));
  const [toInput, setToInput] = useState(initialTo);
  const [dateRange, setDateRange] = useState({ from: toDateInput(initialFromDate), to: initialTo });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await getAnalytics(dateRange);
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics from the database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const interval = window.setInterval(() => load({ silent: true }), 30000);
    return () => window.clearInterval(interval);
  }, [load]);

  const applyDateRange = (event) => {
    event.preventDefault();
    if (!fromInput || !toInput || fromInput > toInput) {
      setError('Choose a valid date range with the start date on or before the end date.');
      return;
    }
    setError('');
    setDateRange({ from: fromInput, to: toInput });
  };

  const registrationData = useMemo(() => {
    const periods = new Map();
    (data?.registrationTrend || []).forEach(({ period, role, count }) => {
      periods.set(period, (periods.get(period) || 0) + count);
    });
    return [...periods.entries()].map(([period, value]) => ({
      label: period.length === 7 ? period.slice(2).replace('-', '/') : period.slice(5),
      value,
      detail: period,
    }));
  }, [data]);

  const orderTrend = (data?.orderTrend || []).map((item) => ({
    label: item.period.length === 7 ? item.period.slice(2).replace('-', '/') : item.period.slice(5),
    value: item.revenue,
    detail: `${item.period}: ${formatCurrency(item.revenue)} revenue from delivered orders`,
  }));

  const roleDistribution = [
    { label: 'Farmers', value: data?.userDistribution?.farmers || 0, color: COLORS.farmer },
    { label: 'Buyers', value: data?.userDistribution?.buyers || 0, color: COLORS.buyer },
    { label: 'Experts', value: data?.userDistribution?.experts || 0, color: COLORS.expert },
    { label: 'Admins', value: data?.userDistribution?.admins || 0, color: COLORS.admin },
  ];
  const orderSegments = Object.entries(data?.orderStats || {}).map(([status, value]) => ({
    label: status.replaceAll('_', ' '),
    value,
    color: ({ pending: '#d4850a', confirmed: '#1565c0', processing: '#7c3aed', shipped: '#0891b2', delivered: '#1a7a1a', cancelled: '#c0392b' })[status] || '#6b7280',
  }));
  const expertSegments = Object.entries(data?.expertStats || {}).map(([status, value]) => ({
    label: status,
    value,
    color: ({ pending: '#d4850a', approved: '#1a7a1a', rejected: '#c0392b' })[status] || '#6b7280',
  }));
  const productData = Object.entries(data?.productStats || {}).map(([status, value]) => ({ label: status, value }));
  const consultationSegments = Object.entries(data?.consultationStats || {}).map(([status, value]) => ({
    label: status,
    value,
    color: ({ pending: '#d4850a', accepted: '#1565c0', completed: '#1a7a1a', rejected: '#c0392b', cancelled: '#6b7280' })[status] || '#7c3aed',
  }));
  const diseaseData = Object.entries(data?.diseaseCaseStats || {}).map(([status, value]) => ({ label: status.replaceAll('_', ' '), value }));
  const cropAdviceData = Object.entries(data?.cropAdviceStats || {}).map(([status, value]) => ({ label: status, value }));
  const totalUsers = roleDistribution.reduce((sum, role) => sum + role.value, 0);
  const totalOrders = sumValues(data?.orderStats);
  const totalProducts = sumValues(data?.productStats);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>⏳</div>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading live analytics…</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📈</span>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Platform Analytics</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Live database metrics · Last updated {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString('en-IN') : '—'}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" disabled={refreshing} onClick={() => load({ silent: true })}>
          {refreshing ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      <form onSubmit={applyDateRange} style={{ display: 'flex', alignItems: 'end', gap: '0.75rem', flexWrap: 'wrap', background: '#fff', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }}>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700 }}>
          From
          <input className="form-input" type="date" value={fromInput} max={toInput || undefined} onChange={(event) => setFromInput(event.target.value)} required />
        </label>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700 }}>
          To
          <input className="form-input" type="date" value={toInput} min={fromInput || undefined} max={toDateInput(new Date())} onChange={(event) => setToInput(event.target.value)} required />
        </label>
        <button type="submit" className="btn btn-primary btn-sm">Apply dates</button>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          Activity charts use this range; total users by role show current all-time registrations.
        </span>
      </form>

      {error && <div role="alert" className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {!data ? null : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <StatsCard icon="👥" label="Total Users" value={formatCount(totalUsers)} bg="#e8f5e9" color="#1a6b1a" />
            <StatsCard icon="🌾" label="Active Farmers" value={formatCount(data.farmerBuyerActivity?.activeFarmers)} bg="#edf7ed" color="#1a6b1a" />
            <StatsCard icon="🛍️" label="Active Buyers" value={formatCount(data.farmerBuyerActivity?.activeBuyers)} bg="#e8f0fe" color="#1565c0" />
            <StatsCard icon="🌿" label="Products in Period" value={formatCount(totalProducts)} bg="#eff6ff" color="#2563eb" />
            <StatsCard icon="📦" label="Orders in Period" value={formatCount(totalOrders)} bg="#fff3e0" color="#e65100" />
            <StatsCard icon="💰" label="Delivered Revenue" value={formatCurrency(data.revenue?.amount)} bg="#ecfdf5" color="#047857" />
            <StatsCard icon="🧑‍🌾" label="Consultation Requests" value={formatCount(sumValues(data.consultationStats))} bg="#f3e8ff" color="#6b21a8" />
            <StatsCard icon="🩺" label="Disease Cases" value={formatCount(sumValues(data.diseaseCaseStats))} bg="#fff7ed" color="#c2410c" />
            <StatsCard icon="🌱" label="Expert Crop Advice" value={formatCount(sumValues(data.cropAdviceStats))} bg="#f0fdf4" color="#15803d" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <ChartCard title="👥 Users by Role · Current Totals">
              <DonutChart segments={roleDistribution} />
            </ChartCard>
            <ChartCard title="📈 New User Registrations · Selected Period">
              {registrationData.length
                ? <BarChart data={registrationData} color="var(--color-primary)" height={170} />
                : <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>No user registrations in this period.</p>}
            </ChartCard>
            <ChartCard title="🧑‍🌾 Farmer & Buyer Activity · Selected Period">
              <DonutChart segments={[
                { label: 'Active farmers', value: data.farmerBuyerActivity?.activeFarmers || 0, color: COLORS.farmer },
                { label: 'Active buyers', value: data.farmerBuyerActivity?.activeBuyers || 0, color: COLORS.buyer },
              ]} />
            </ChartCard>
            <ChartCard title="✅ Expert Verification · Selected Period">
              <DonutChart segments={expertSegments} />
            </ChartCard>
            <ChartCard title="📦 Orders by Status · Selected Period">
              <DonutChart segments={orderSegments} />
            </ChartCard>
            <ChartCard title="💰 Delivered Order Revenue · Selected Period">
              {orderTrend.some((item) => item.value > 0)
                ? <BarChart data={orderTrend} color="#15803d" height={170} valueFormatter={formatCurrency} />
                : <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>No delivered-order revenue in this period.</p>}
            </ChartCard>
            <ChartCard title="🌿 Products by Status · Selected Period">
              <BarChart data={productData} color="#1565c0" height={160} />
            </ChartCard>
            <ChartCard title="🗓️ Consultation Status · Selected Period">
              <DonutChart segments={consultationSegments} />
            </ChartCard>
            <ChartCard title="🩺 Disease Cases by Status · Selected Period">
              <BarChart data={diseaseData} color="#c2410c" height={160} />
            </ChartCard>
            <ChartCard title="🌱 Crop Advice by Status · Selected Period">
              <BarChart data={cropAdviceData} color="#15803d" height={160} />
            </ChartCard>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 0 }}>
            Revenue is calculated from delivered orders only, using each order’s stored total amount. Metrics refresh automatically every 30 seconds.
          </p>
        </>
      )}
    </div>
  );
};

export default Analytics;
