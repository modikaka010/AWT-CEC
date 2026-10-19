import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FarmProvider, useFarms } from '../../context/FarmContext';
import FarmerLayout from '../../layouts/FarmerLayout';
import FarmForm from './FarmForm';
import Loader from '../common/Loader';
import Logo from '../common/Logo';

/** Full-screen "create your first farm" step shown instead of the portal. */
const FarmOnboarding = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { options, addFarm } = useFarms();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', overflowY: 'auto' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Logo size="sm" showTagline={false} />
          <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>

        <div className="card" style={{ background: '#fff', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
            🌱 Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Let's set up your farm
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Register your first farm to unlock your dashboard. You can add more farms and edit these details later from <strong>My Farm</strong>.
          </p>
          {/* addFarm updates the context → the gate re-renders into the portal automatically */}
          <FarmForm options={options} onSubmit={addFarm} submitLabel="Create Farm & Continue" />
        </div>
      </div>
    </div>
  );
};

const Gate = () => {
  const { farms, loading, error, refresh } = useFarms();

  if (loading && farms.length === 0) return <Loader fullPage text="Loading your farm…" />;

  // Never treat a failed request as "no farms" — that would wrongly force re-onboarding
  if (error && farms.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: '2rem' }}>
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>
          <button className="btn btn-primary" onClick={refresh}>Try again</button>
        </div>
      </div>
    );
  }

  if (farms.length === 0) return <FarmOnboarding />;
  return <FarmerLayout />;
};

/**
 * Wraps the farmer portal: a farmer with no farm must create one before seeing anything else.
 */
const FarmGate = () => (
  <FarmProvider>
    <Gate />
  </FarmProvider>
);

export default FarmGate;