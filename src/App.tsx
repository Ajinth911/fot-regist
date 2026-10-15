import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { RegisterPage } from './views/RegisterPage';
import { SuccessPage } from './views/SuccessPage';
import { TermsPage } from './views/TermsPage';
import { PrivacyPage } from './views/PrivacyPage';
import { AdminLoginPage } from './views/AdminLoginPage';
import { AdminDashboardPage } from './views/AdminDashboardPage';

function ProtectedAdminRoute() {
  const { admin, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-xs text-[#55554F] font-medium">
        Verifying administrator session...
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminDashboardPage
      admin={admin}
      onLogout={logout}
      onViewPublic={() => {
        window.location.href = '/';
      }}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - Direct Registration Only */}
          <Route path="/" element={<RegisterPage />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/register/success" element={<SuccessPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={<ProtectedAdminRoute />} />

          {/* Any other URL redirects to registration */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
