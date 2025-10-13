import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const MessagesContext = createContext(null);

export const MessagesProvider = ({ children, pollInterval = 30000 }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total_conversas: 0,
    conversas_com_novas: 0,
    total_mensagens: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetState = useCallback(() => {
    if (!isMountedRef.current) return;
    setSummary({ total_conversas: 0, conversas_com_novas: 0, total_mensagens: 0 });
    setLoading(false);
    setError(null);
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!user) {
      resetState();
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getMessagesUnreadSummary();
      if (!isMountedRef.current) return;

      if (response?.success) {
        setSummary(response.summary || { total_conversas: 0, conversas_com_novas: 0, total_mensagens: 0 });
        setError(null);
      } else {
        setError(response?.message || 'Erro ao carregar resumo de mensagens');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('MessagesProvider - erro ao carregar resumo de mensagens:', err);
      setError(err?.message || 'Erro ao carregar resumo de mensagens');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, resetState]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!user) {
      resetState();
      return;
    }

    fetchSummary();

    if (pollInterval && pollInterval > 0) {
      const id = setInterval(fetchSummary, pollInterval);
      return () => clearInterval(id);
    }

    return undefined;
  }, [user, fetchSummary, pollInterval, resetState]);

  const value = useMemo(() => ({
    summary,
    unreadTotal: summary.total_mensagens,
    conversationsWithNew: summary.conversas_com_novas,
    loading,
    error,
    refresh: fetchSummary,
    reset: resetState,
  }), [summary, loading, error, fetchSummary, resetState]);

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === null) {
    throw new Error('useMessages deve ser utilizado dentro de MessagesProvider');
  }
  return context;
};
