import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import ExternalRedirect from './pages/ExternalRedirect.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import { ToastViewport } from './context/ToastContext.jsx';

const App = () => {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <AppLayout>
      <Routes location={background || location}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/curso/:identifier"
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/:target" element={<ExternalRedirect />} />
        <Route path="/:target/*" element={<ExternalRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastViewport />
    </AppLayout>
  );
};

export default App;
