import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * useFetch — simple data-fetching hook for GET requests.
 * @param {string|null} url  - API path; pass null to skip
 * @param {object} [options] - { deps: [] } re-fetch when deps change
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    api
      .get(url, { signal: abortRef.current.signal })
      .then((res) => {
        setData(res.data?.data ?? res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError(err.response?.data?.message || err.message || 'Request failed');
          setLoading(false);
        }
      });

    return () => abortRef.current?.abort();
  }, [url, ...(options.deps || [])]);

  return { data, loading, error };
};

export default useFetch;
