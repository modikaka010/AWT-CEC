import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as farmerService from '../services/farmerService';

const FarmContext = createContext(null);

const FALLBACK_OPTIONS = {
  AREA_UNITS: ['acres', 'hectares', 'bigha'],
  SOIL_TYPES: ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy', 'Saline / Alkaline', 'Other'],
  IRRIGATION_TYPES: ['Drip', 'Sprinkler', 'Flood / Canal', 'Tube-well', 'Rain-fed', 'Solar Pump', 'Other'],
  WATER_SOURCES: ['Canal', 'Borewell', 'River', 'Pond / Tank', 'Rainwater', 'Well', 'Other'],
};

export const getApiError = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || (err?.request ? 'Cannot reach the server. Check your connection.' : fallback);

/**
 * Holds the authenticated farmer's farms. Shared by the first-login gate and the
 * My Farm page so both always agree on what exists in the database.
 */
export const FarmProvider = ({ children }) => {
  const [farms, setFarms]     = useState([]);
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await farmerService.getFarms();
      setFarms(res.data.data.farms);
      if (res.data.data.options) setOptions(res.data.data.options);
    } catch (err) {
      setError(getApiError(err, 'Failed to load your farms.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addFarm = useCallback(async (payload) => {
    const res = await farmerService.createFarm(payload);
    const farm = res.data.data.farm;
    setFarms((prev) => [...prev, farm]);
    return farm;
  }, []);

  const editFarm = useCallback(async (id, payload) => {
    const res = await farmerService.updateFarm(id, payload);
    const farm = res.data.data.farm;
    setFarms((prev) => prev.map((f) => (f._id === id ? farm : f)));
    return farm;
  }, []);

  const removeFarm = useCallback(async (id) => {
    await farmerService.deleteFarm(id);
    setFarms((prev) => prev.filter((f) => f._id !== id));
  }, []);

  const value = useMemo(
    () => ({ farms, options, loading, error, refresh, addFarm, editFarm, removeFarm }),
    [farms, options, loading, error, refresh, addFarm, editFarm, removeFarm]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
};

export const useFarms = () => {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error('useFarms must be used inside <FarmProvider>');
  return ctx;
};