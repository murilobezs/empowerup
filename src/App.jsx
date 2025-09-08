import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute, AdminRoute, LazyWrapper } from './components/routing';
import { ROUTES } from './constants';
import './App.css';

// Lazy loading dos componentes para melhor performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const CadastroPage = React.lazy(() => import('./pages/CadastroPage'));
const ComunidadePage = React.lazy(() => import('./pages/ComunidadePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage'));
const MensagensPage = React.lazy(() => import('./pages/MensagensPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const EventsPage = React.lazy(() => import('./pages/EventsPage'));
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const TrendingPage = React.lazy(() => import('./pages/TrendingPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

/**
 * Componente principal da aplicação
 */
function App() {
  return (
    <AuthProvider>
      <LazyWrapper>
        <Routes>
          {/* Rotas públicas */}
          <Route 
            path={ROUTES.HOME} 
            element={<HomePage />} 
          />
          
          <Route 
            path={ROUTES.ABOUT} 
            element={<AboutPage />} 
          />
          
          <Route 
            path={ROUTES.CONTACT} 
            element={<ContactPage />} 
          />

          {/* Rotas de autenticação (apenas para não logados) */}
          <Route 
            path={ROUTES.LOGIN} 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path={ROUTES.REGISTER} 
            element={
              <PublicRoute>
                <CadastroPage />
              </PublicRoute>
            } 
          />

          {/* Rotas protegidas (apenas para usuários logados) */}
          <Route 
            path={ROUTES.FEED} 
            element={
              <ProtectedRoute>
                <ComunidadePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path={ROUTES.PROFILE} 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/perfil/:username" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path={ROUTES.EDIT_PROFILE} 
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path={ROUTES.MENSAGENS} 
            element={
              <ProtectedRoute>
                <MensagensPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path={ROUTES.EVENTS} 
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path={ROUTES.GROUPS} 
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path={ROUTES.EXPLORE} 
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path={ROUTES.TRENDING} 
            element={
              <ProtectedRoute>
                <TrendingPage />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de admin */}
          <Route 
            path={ROUTES.ADMIN_LOGIN} 
            element={
              <PublicRoute redirectTo={ROUTES.ADMIN}>
                <AdminLogin />
              </PublicRoute>
            } 
          />
          
          <Route 
            path={ROUTES.ADMIN} 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Rota 404 */}
          <Route 
            path="*" 
            element={<NotFoundPage />} 
          />
        </Routes>
      </LazyWrapper>
    </AuthProvider>
  );
}

export default App;


