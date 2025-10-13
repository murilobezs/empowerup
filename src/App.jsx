import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { MessagesProvider } from './contexts/MessagesContext';
import { ProtectedRoute, PublicRoute, AdminRoute, LazyWrapper } from './components/routing';
import { ROUTES } from './constants';
import { PageTransition } from './components/common';
import MobileBottomNav from './components/navigation/MobileBottomNav';
import './App.css';

// Lazy loading dos componentes para melhor performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const CadastroPage = React.lazy(() => import('./pages/CadastroPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const ComunidadePage = React.lazy(() => import('./pages/ComunidadePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage'));
const MensagensPage = React.lazy(() => import('./pages/MensagensPage'));
const NotificacoesPage = React.lazy(() => import('./pages/NotificacoesPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const LegalPage = React.lazy(() => import('./pages/LegalPage'));
const EventsPage = React.lazy(() => import('./pages/EventsPage'));
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'));
const GroupDetailPage = React.lazy(() => import('./pages/GroupDetailPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const TrendingPage = React.lazy(() => import('./pages/TrendingPage'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetailPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const AdCampaignsPage = React.lazy(() => import('./pages/AdCampaignsPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const SavedPostsPage = React.lazy(() => import('./pages/SavedPostsPage'));

/**
 * Componente principal da aplicação
 */
function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <NotificationsProvider>
        <MessagesProvider>
          <LazyWrapper>
            <>
            <PageTransition key={location.pathname}>
              <Routes location={location}>
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

          <Route 
            path={ROUTES.VERIFY_EMAIL}
            element={<VerifyEmailPage />}
          />

          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />

          <Route
            path={ROUTES.RESET_PASSWORD}
            element={<ResetPasswordPage />}
          />

          <Route 
            path={ROUTES.TERMS}
            element={<LegalPage defaultSection="terms" />}
          />

          <Route 
            path={ROUTES.PRIVACY}
            element={<LegalPage defaultSection="privacy" />}
          />

          <Route 
            path={ROUTES.COURSES} 
            element={<CoursesPage />} 
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
            path={ROUTES.NOTIFICACOES} 
            element={
              <ProtectedRoute>
                <NotificacoesPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path={ROUTES.COURSE_DETAIL} 
            element={
              <ProtectedRoute>
                <CourseDetailPage />
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
            path={ROUTES.GROUP_DETAIL} 
            element={
              <ProtectedRoute>
                <GroupDetailPage />
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
            path={ROUTES.SUBSCRIPTIONS} 
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path={ROUTES.AD_CAMPAIGNS} 
            element={
              <ProtectedRoute>
                <AdCampaignsPage />
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

          <Route 
            path={ROUTES.SAVED_POSTS} 
            element={
              <ProtectedRoute>
                <SavedPostsPage />
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
            </PageTransition>
            <MobileBottomNav />
            </>
          </LazyWrapper>
        </MessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;


