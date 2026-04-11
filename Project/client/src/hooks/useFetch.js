import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { immediate = true, params = {} } = options;

  const fetchData = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, { params: overrideParams || params });
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [url, immediate]);

  return { data, loading, error, refetch: fetchData };
}
