import { useState, useEffect } from 'react';
import { authClient } from '../lib/authClient';
import { authService } from '../services/authService';

export const useAuthHook = () => {
  const sessionState = authClient.useSession();
  const session = sessionState?.data ?? null;
  const sessionLoading = sessionState?.isPending ?? false;
  const sessionError = sessionState?.error ?? null;

  const user = session?.user ?? null;

  const [userPreferences, setUserPreferences] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionError) setError(sessionError.message ?? String(sessionError));
  }, [sessionError]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.id) {
        setUserPreferences(null);
        return;
      }
      const prefs = await authService.getUserPreferences(user.id);
      if (!cancelled) setUserPreferences(prefs);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const wrap = fn => async (...args) => {
    try {
      setError(null);
      return await fn(...args);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    userPreferences,
    loading: sessionLoading,
    error,
    signUp: wrap(authService.signUp.bind(authService)),
    signIn: wrap(authService.signIn.bind(authService)),
    signInWithGoogle: wrap(authService.signInWithGoogle.bind(authService)),
    signOut: wrap(authService.signOut.bind(authService)),
  };
};
