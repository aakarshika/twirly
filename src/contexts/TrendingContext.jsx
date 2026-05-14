import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../lib/apiClient';

const TrendingContext = createContext();

export const useTrending = () => {
  const ctx = useContext(TrendingContext);
  if (!ctx) throw new Error('useTrending must be used within a TrendingProvider');
  return ctx;
};

export const TrendingProvider = ({ children }) => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTrending = useCallback(async ({ limit = 20 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/trending', { params: { limit } });
      setSets(res.data.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load trending');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFiltered = useCallback(async ({ categoryId, excludeVoted = false, limit = 20 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit };
      if (categoryId) params.categoryId = categoryId;
      if (excludeVoted && user) { params.excludeVoted = true; params.userId = user.id; }
      const res = await apiClient.get('/api/sets', { params });
      setSets(res.data.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load sets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <TrendingContext.Provider value={{ sets, loading, error, fetchTrending, fetchFiltered }}>
      {children}
    </TrendingContext.Provider>
  );
};
