import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../common';
import adminApi from '../../services/admin-api';
import { getStoredToken } from '../../utils/authStorage';

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
        hasStoredToken: !!getStoredToken(),
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
  const location = useLocation();
  const isAdminLoggedIn = adminApi.isAuthenticated();
  const isAdminLoginRoute = location?.pathname?.endsWith('/admin/login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Carregando..." />
      </div>
    );
  }

  // Se for a rota de admin login
  if (isAdminLoginRoute) {
    // Redirecionar automaticamente caso o admin já esteja logado
    if (isAdminLoggedIn) {
      return <Navigate to="/admin" replace />;
    }
    // Permitir acesso ao formulário mesmo que o usuário comum esteja autenticado
    return children;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente para rotas de admin
 */
export const AdminRoute = ({ children, redirectTo = '/admin/login' }) => {
  const { user, loading } = useAuth();
  const [adminChecked, setAdminChecked] = React.useState(!adminApi.isAuthenticated());
  const [adminValid, setAdminValid] = React.useState(adminApi.isAuthenticated());

  React.useEffect(() => {
    let isMounted = true;

    const validate = async () => {
      if (!adminApi.isAuthenticated()) {
        if (isMounted) {
          setAdminChecked(true);
          setAdminValid(false);
        }
        return;
      }

      try {
        await adminApi.validateSession();
        if (isMounted) {
          setAdminValid(true);
          setAdminChecked(true);
        }
      } catch (error) {
        console.warn('Admin session validation failed:', error?.message || error);
        if (isMounted) {
          setAdminValid(false);
          setAdminChecked(true);
        }
      }
    };

    validate();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAdminUser = user && user.tipo === 'admin';
  const ready = adminChecked || isAdminUser;

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Verificando permissões..." />
      </div>
    );
  }

  if (!adminValid && !isAdminUser) {
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
