import { useState, useCallback } from 'react';
import { LOADING_STATES } from '../constants';
import { errorHandler } from '../utils';

/**
 * Hook genérico para operações assíncronas
 */
export const useAsync = (asyncFunction) => {
  const [state, setState] = useState({
    status: LOADING_STATES.IDLE,
    data: null,
    error: null
  });

  const execute = useCallback(async (...args) => {
    setState({
      status: LOADING_STATES.LOADING,
      data: null,
      error: null
    });

    try {
      const result = await asyncFunction(...args);
      setState({
        status: LOADING_STATES.SUCCESS,
        data: result,
        error: null
      });
      return result;
    } catch (error) {
      const errorMessage = errorHandler.getErrorMessage(error);
      setState({
        status: LOADING_STATES.ERROR,
        data: null,
        error: errorMessage
      });
      throw error;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({
      status: LOADING_STATES.IDLE,
      data: null,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === LOADING_STATES.LOADING,
    isSuccess: state.status === LOADING_STATES.SUCCESS,
    isError: state.status === LOADING_STATES.ERROR,
    isIdle: state.status === LOADING_STATES.IDLE
  };
};

/**
 * Hook para toggle de estados booleanos
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse, setValue }];
};

/**
 * Hook para controle de modais
 */
export const useModal = () => {
  const [isOpen, { setTrue: open, setFalse: close, toggle }] = useToggle(false);
  
  return {
    isOpen,
    open,
    close,
    toggle
  };
};

/**
 * Hook para paginação
 */
export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(p => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage(p => p - 1);
  }, [hasPrevPage]);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    reset
  };
};

/**
 * Hook para busca com debounce
 */
export const useSearch = (searchFunction, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchFunction(searchQuery);
        setResults(searchResults);
      } catch (error) {
        errorHandler.logError(error, 'Search');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delay),
    [searchFunction, delay]
  );

  const search = useCallback((newQuery) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  }, []);

  return {
    query,
    results,
    isSearching,
    search,
    clearSearch,
    setQuery
  };
};

/**
 * Helper function para debounce (movido do utils para evitar circular dependency)
 */
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}
