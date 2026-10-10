import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserAuthProvider } from './hooks/useUserAuth';
import { HomePage } from './views/HomePage';
import { RegisterPage } from './views/RegisterPage';
import { SuccessPage } from './views/SuccessPage';
import { TermsPage } from './views/TermsPage';
import { PrivacyPage } from './views/PrivacyPage';
import { LoginPage } from './views/LoginPage';
import { SignUpPage } from './views/SignUpPage';
import { UserDashboardPage } from './views/UserDashboardPage';
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
      <UserAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/success" element={<SuccessPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Attendee / User Auth & Dashboard */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={<ProtectedAdminRoute />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UserAuthProvider>
    </AuthProvider>
  );
}

export default App;
