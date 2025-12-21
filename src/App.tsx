import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { SelectNetwork } from './pages/onboarding/SelectNetwork';
import { WalletAddress } from './pages/onboarding/WalletAddress';
import { SelectNotifications } from './pages/onboarding/SelectNotifications';
import { TestNotification } from './pages/onboarding/TestNotification';
import { WalletSettings } from './pages/WalletSettings';
import { NotificationSettings } from './pages/NotificationSettings';
import { Billing } from './pages/Billing';
import { FAQ } from './pages/FAQ';
import { Support } from './pages/Support';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/onboarding/network" element={
            <ProtectedRoute>
              <SelectNetwork />
            </ProtectedRoute>
          } />

          <Route path="/onboarding/wallet-address" element={
            <ProtectedRoute>
              <WalletAddress />
            </ProtectedRoute>
          } />

          <Route path="/onboarding/notifications" element={
            <ProtectedRoute>
              <SelectNotifications />
            </ProtectedRoute>
          } />

          <Route path="/onboarding/test" element={
            <ProtectedRoute>
              <TestNotification />
            </ProtectedRoute>
          } />

          <Route path="/wallet/:id" element={
            <ProtectedRoute>
              <WalletSettings />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationSettings />
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />

          <Route path="/faq" element={
            <ProtectedRoute>
              <FAQ />
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
