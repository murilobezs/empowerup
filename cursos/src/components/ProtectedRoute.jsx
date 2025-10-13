import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import config from '@shared/config/config';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const shouldRedirect = !loading && !isAuthenticated;

  useEffect(() => {
    if (!shouldRedirect) return;
    const mainLogin = `${config.BASE_URL || 'https://www.empowerup.com.br'}/login`;
    window.location.href = `${mainLogin}?redirect=${encodeURIComponent(window.location.href)}`;
  }, [shouldRedirect]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-coral/40 border-t-coral" aria-label="Carregando" />
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-coral/40 border-t-coral" aria-label="Redirecionando" />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
