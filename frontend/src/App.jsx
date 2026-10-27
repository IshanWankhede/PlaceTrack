import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import DashboardRouter from './pages/dashboard/DashboardRouter.jsx';
import ApplicationsPage from './pages/dashboard/ApplicationsPage.jsx';
import StudentsPage from './pages/dashboard/StudentsPage.jsx';
import JobsPage from './pages/dashboard/JobsPage.jsx';
import CompaniesPage from './pages/dashboard/CompaniesPage.jsx';
import PlacementsPage from './pages/dashboard/PlacementsPage.jsx';
import AnalyticsPage from './pages/dashboard/AnalyticsPage.jsx';
import StudentMyApplications from './pages/dashboard/StudentMyApplications.jsx';
import StudentMyPlacement from './pages/dashboard/StudentMyPlacement.jsx';
import ProfilePage from './pages/dashboard/ProfilePage.jsx';
import UserManagementPage from './pages/dashboard/UserManagementPage.jsx';
import PlacementPoliciesPage from './pages/dashboard/PlacementPoliciesPage.jsx';
import StaffEligibleStudentsPage from './pages/dashboard/StaffEligibleStudentsPage.jsx';
import StaffInterviewsPage from './pages/dashboard/StaffInterviewsPage.jsx';
import StaffResultsSelectionPage from './pages/dashboard/StaffResultsSelectionPage.jsx';
import StudentInterviewsPage from './pages/dashboard/StudentInterviewsPage.jsx';
import StudentProgressPage from './pages/dashboard/StudentProgressPage.jsx';
import StudentSettingsPage from './pages/dashboard/StudentSettingsPage.jsx';
import NotificationsPage from './pages/dashboard/NotificationsPage.jsx';
import SmoothCursor from './components/ui/SmoothCursor.jsx';
import Button from './components/ui/Button.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function RoleProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, activeDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Not authenticated → redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Role check against allowedRoles
  if (Array.isArray(allowedRoles) && !allowedRoles.includes(activeDemoRole)) {
    return (
      <DashboardLayout>
        <div className="min-h-[65vh] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white/90 backdrop-blur-2xl rounded-[32px] p-8 border border-rose-200 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Role Guard · Restricted Route
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F]">
                Unauthorized Role Access
              </h2>
              <p className="text-xs text-[#64748B] leading-relaxed">
                The route{' '}
                <code className="font-mono font-bold text-[#0B0B0F] bg-slate-100 px-1.5 py-0.5 rounded">
                  {location.pathname}
                </code>{' '}
                requires <strong className="text-[#0B0B0F]">{allowedRoles.join(' or ')}</strong> permissions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Your Role:</span>
                <span className="font-bold text-[#0B0B0F]">{activeDemoRole}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SmoothCursor />
        <BrowserRouter>
          <Routes>
            {/* Landing Showcase */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />

            {/* Centralized Role-Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'STUDENT']}>
                  <DashboardRouter />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <StudentsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user-management"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagementPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/companies"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <CompaniesPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/jobs"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'STUDENT']}>
                  <JobsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/eligible-students"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <StaffEligibleStudentsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/applications"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <ApplicationsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/interviews"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <StaffInterviewsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/results"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <StaffResultsSelectionPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/placements"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <PlacementsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                  <AnalyticsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/policies"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                  <PlacementPoliciesPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-applications"
              element={
                <RoleProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentMyApplications />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-interviews"
              element={
                <RoleProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentInterviewsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-placement"
              element={
                <RoleProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentMyPlacement />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-offers"
              element={
                <RoleProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentMyPlacement />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-progress"
              element={
                <RoleProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentProgressPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <RoleProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentSettingsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notifications"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'STUDENT']}>
                  <NotificationsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'STUDENT']}>
                  <ProfilePage />
                </RoleProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
