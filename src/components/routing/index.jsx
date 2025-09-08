import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../common';

/**
 * Componente para rotas protegidas (apenas usuários logados)
 */
export const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Debug para identificar problemas de autenticação
  React.useEffect(() => {
    if (!loading) {
      console.log('ProtectedRoute - Debug:', { 
        isAuthenticated, 
        hasUser: !!user, 
        userFromLocalStorage: !!localStorage.getItem('empowerup_user') 
      });
    }
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Verificando autenticação..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.warn('ProtectedRoute - Redirecting to login:', { isAuthenticated, user: !!user });
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente para rotas públicas (apenas usuários não logados)
 */
export const PublicRoute = ({ children, redirectTo = '/comunidade' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Carregando..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente para rotas de admin
 */
export const AdminRoute = ({ children, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Verificando permissões..." />
      </div>
    );
  }

  if (!user || user.tipo !== 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Wrapper para lazy loading de componentes
 */
export const LazyWrapper = ({ children }) => {
  return (
    <React.Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Carregando página..." />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};
