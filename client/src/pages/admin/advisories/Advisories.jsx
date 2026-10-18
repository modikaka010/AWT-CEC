import React, { useCallback, useEffect, useState } from 'react';
import { getAdvisories } from '../../../services/adminService';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';

const TYPES = [
  { value: 'consultations', label: 'Consultations' },
  { value: 'disease-cases', label: 'Disease Cases' },
  { value: 'crop-advice', label: 'Crop Advice' },
];

const STATUSES = {
  consultations: ['', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'],
  'disease-cases': ['', 'pending', 'under_review', 'diagnosed', 'closed'],
  'crop-advice': ['', 'draft', 'published'],
};

const textValue = (value) => (typeof value === 'string' && value.trim() ? value : '—');

const Info = ({ label, value }) => (
  <div style={{ minWidth: 0 }}>
    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>{label}</p>
    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{textValue(value)}</p>
  </div>
);

const Person = ({ label, person }) => (
  <Info label={label} value={person ? `${person.name || 'Unknown'}${person.loginId ? ` · ${person.loginId}` : ''}` : 'Unassigned'} />
);

const ConsultationDetails = ({ item }) => (
  <>
    <Info label="Description" value={item.description} />
    <Info label="Symptoms" value={item.symptoms} />
    <Info label="Category / crop stage" value={[item.category, item.cropStage].filter(Boolean).join(' · ')} />
    <Info label="Farm location" value={item.farmLocation} />
    {item.images?.length > 0 && (
      <div style={{ gridColumn: '1 / -1' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Farmer images</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
          {item.images.map((src, index) => (
            <a key={`${src}-${index}`} href={src} target="_blank" rel="noreferrer">
              <img src={src} alt={`Consultation attachment ${index + 1}`} style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 6 }} />
            </a>
          ))}
        </div>
      </div>
    )}
    {item.expertResponse && (
      <>
        <Info label="Expert diagnosis" value={item.expertResponse.diagnosis} />
        <Info label="Expert advice" value={item.expertResponse.advice} />
        <Info label="Recommended actions" value={item.expertResponse.recommendedActions} />
        <Info label="Precautions" value={item.expertResponse.precautions} />
        <Info label="Follow-up" value={item.expertResponse.followUp} />
      </>
    )}
  </>
);

const DiseaseCaseDetails = ({ item }) => (
  <>
    <Info label="Plant part" value={item.plantPart} />
    <Info label="Symptoms" value={item.symptoms} />
    <Info label="Description" value={item.description} />
    <Info label="Farm location" value={item.farmLocation} />
    <Info label="Possible disease" value={item.expertAdvice?.possibleDisease} />
    <Info label="Diagnosis" value={item.expertAdvice?.diagnosis} />
    <Info label="Treatment" value={item.expertAdvice?.treatment} />
    <Info label="Precautions" value={item.expertAdvice?.precautions} />
    <Info label="Follow-up" value={item.expertAdvice?.followUp} />
    {item.images?.length > 0 && (
      <div style={{ gridColumn: '1 / -1' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>Farmer images</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
          {item.images.map((src, index) => (
            <a key={`${src}-${index}`} href={src} target="_blank" rel="noreferrer">
              <img src={src} alt={`Disease case attachment ${index + 1}`} style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 6 }} />
            </a>
          ))}
        </div>
      </div>
    )}
  </>
);

const CropAdviceDetails = ({ item }) => (
  <>
    <Info label="Growth stage" value={item.growthStage} />
    <Info label="Observed problem" value={item.observedProblem} />
    <Info label="Recommended actions" value={item.recommendedActions} />
    <Info label="Irrigation advice" value={item.irrigationAdvice} />
    <Info label="Nutrient advice" value={item.nutrientAdvice} />
    <Info label="Pest precautions" value={item.pestPrecautions} />
    <Info label="Harvest advice" value={item.harvestAdvice} />
    <Info label="Additional notes" value={item.additionalNotes} />
    <Info
      label="Linked case"
      value={item.consultation?.problemTitle || (item.diseaseCase ? `Disease case · ${item.diseaseCase.cropName}` : '')}
    />
  </>
);

const AdvisoryCard = ({ item, type }) => {
  const heading = type === 'consultations'
    ? item.problemTitle
    : type === 'disease-cases'
      ? `${item.cropName} disease case`
      : `${item.cropName} crop advice`;
  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Date unavailable';

  return (
    <details style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 180, flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{heading || 'Advisory record'}</p>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              {item.cropName || 'Crop not specified'} · {date}
            </p>
          </div>
          <Person label="Farmer" person={item.farmer} />
          <Person label="Expert" person={item.expert} />
          <StatusBadge status={item.status} />
        </div>
      </summary>
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {type === 'consultations' && <ConsultationDetails item={item} />}
        {type === 'disease-cases' && <DiseaseCaseDetails item={item} />}
        {type === 'crop-advice' && <CropAdviceDetails item={item} />}
      </div>
    </details>
  );
};

const Advisories = () => {
  const [type, setType] = useState('consultations');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdvisories({
        type,
        status: status || undefined,
        search: search || undefined,
        page,
        limit: 15,
      });
      setRecords(response.data.data.records || []);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load consultations and advice.');
    } finally {
      setLoading(false);
    }
  }, [type, status, search]);

  useEffect(() => { load(1); }, [load]);

  const selectType = (nextType) => {
    setType(nextType);
    setStatus('');
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🧑‍🌾</span>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>Consultations & Expert Advice</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Read-only oversight of farmer requests and expert responses · {pagination.total} records
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Advisory record type" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {TYPES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={type === option.value}
            onClick={() => selectType(option.value)}
            className={type === option.value ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form onSubmit={submitSearch} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <select
          className="form-input"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          style={{ width: 'auto', minWidth: 155 }}
        >
          {STATUSES[type].map((value) => (
            <option key={value || 'all'} value={value}>{value ? value.replaceAll('_', ' ') : 'All statuses'}</option>
          ))}
        </select>
        <input
          className="form-input"
          aria-label="Search advisory records"
          placeholder="Search crop, problem, symptoms…"
          maxLength={100}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <button type="submit" className="btn btn-secondary btn-sm">Search</button>
      </form>

      {error && <div role="alert" className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <p style={{ padding: '2rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading records…</p>
      ) : records.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          No records found for these filters.
        </div>
      ) : records.map((item) => <AdvisoryCard key={item._id} item={item} type={type} />)}

      <Pagination page={pagination.page} pages={pagination.pages} onPage={load} />
    </div>
  );
};

export default Advisories;
