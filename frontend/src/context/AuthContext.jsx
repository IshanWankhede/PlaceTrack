/**
 * AuthContext – real JWT-backed implementation for the PlaceTrack frontend.
 *
 * Design decisions:
 *  - Keeps the exact same context value shape as the prototype's demo AuthContext so that
 *    every page component (copied verbatim from prototype/) continues to work without changes.
 *  - On successful POST /api/v1/auth/login we get { access_token, user } from FastAPI.
 *  - The JWT is stored in localStorage and injected into every Axios request via api.js interceptor.
 *  - Role, permissions and all auxiliary fields are derived from the user object returned by the API.
 *  - IS_DEMO_ENVIRONMENT = false so the "Switch Account" buttons are hidden.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import api from '../services/api.js';
import { triggerGlobalToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const IS_DEMO_ENVIRONMENT = false;
export const DEMO_ACCOUNTS_REGISTRY = [];

// ─── Role permission map (mirrors prototype so pages work unchanged) ──────────
export const ROLE_PERMISSIONS = {
  ADMIN: {
    label: 'CDC Super Admin',
    badge: 'ADMIN',
    allowedRoutes: [
      '/dashboard',
      '/dashboard/students',
      '/dashboard/user-management',
      '/dashboard/companies',
      '/dashboard/jobs',
      '/dashboard/eligible-students',
      '/dashboard/applications',
      '/dashboard/interviews',
      '/dashboard/results',
      '/dashboard/placements',
      '/dashboard/analytics',
      '/dashboard/policies',
      '/dashboard/notifications',
      '/dashboard/profile',
    ],
    canManageDrives: true,
    canManageCompanies: true,
    canVerifyCgpa: true,
    canPromoteRounds: true,
    canViewExecutiveAnalytics: true,
    canManageUsers: true,
    canManagePolicies: true,
  },
  STAFF: {
    label: 'Placement Staff (TPO)',
    badge: 'STAFF',
    allowedRoutes: [
      '/dashboard',
      '/dashboard/students',
      '/dashboard/companies',
      '/dashboard/jobs',
      '/dashboard/eligible-students',
      '/dashboard/applications',
      '/dashboard/interviews',
      '/dashboard/results',
      '/dashboard/placements',
      '/dashboard/notifications',
      '/dashboard/profile',
    ],
    canManageDrives: true,
    canManageCompanies: true,
    canVerifyCgpa: true,
    canPromoteRounds: true,
    canViewExecutiveAnalytics: false,
    canManageUsers: false,
    canManagePolicies: false,
  },
  STUDENT: {
    label: 'Student Candidate',
    badge: 'STUDENT',
    allowedRoutes: [
      '/dashboard',
      '/dashboard/profile',
      '/dashboard/jobs',
      '/dashboard/my-applications',
      '/dashboard/my-interviews',
      '/dashboard/my-placement',
      '/dashboard/my-offers',
      '/dashboard/my-progress',
      '/dashboard/notifications',
      '/dashboard/settings',
    ],
    canManageDrives: false,
    canManageCompanies: false,
    canVerifyCgpa: false,
    canPromoteRounds: false,
    canViewExecutiveAnalytics: false,
    canManageUsers: false,
    canManagePolicies: false,
  },
};

const TOKEN_KEY = 'placetrack_access_token';
const USER_KEY = 'placetrack_user';

function loadPersistedSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (token && raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadPersistedSession);
  const [notification, setNotification] = useState(null);

  // ── Inject / remove JWT from Axios on user change ────────────────────────
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [currentUser]);

  // ── Core login: calls POST /api/v1/auth/login ────────────────────────────
  const login = useCallback(async (email, password) => {
    const resp = await api.post('/auth/login', { email, password });
    const { access_token, user } = resp.data;

    // Persist
    localStorage.setItem(TOKEN_KEY, access_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    // Normalise user shape to be compatible with prototype pages
    const normalised = normaliseUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(normalised));
    setCurrentUser(normalised);
    return normalised;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  }, []);

  // ── setUser: allows pages to update profile fields locally ───────────────
  const setUser = useCallback((updaterOrVal) => {
    setCurrentUser((prev) => {
      const next =
        typeof updaterOrVal === 'function' ? updaterOrVal(prev) : updaterOrVal;
      if (!next) return null;
      const normalised = normaliseUser({ ...prev, ...next });
      localStorage.setItem(USER_KEY, JSON.stringify(normalised));
      return normalised;
    });
  }, []);

  // ── showToast helper ─────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success', description = '') => {
    setNotification({ message, type });
    triggerGlobalToast(message, description, type);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const [previewRole, setPreviewRole] = useState(null);

  // ── Derived values ───────────────────────────────────────────────────────
  const realRole = currentUser?.role || null;
  const activeDemoRole = (realRole === 'ADMIN' && previewRole) ? previewRole : realRole;
  const isDemoSession = Boolean(currentUser);
  const currentPermissions =
    ROLE_PERMISSIONS[activeDemoRole] || ROLE_PERMISSIONS.STUDENT;

  const switchRole = useCallback((newRole) => {
    if (currentUser?.role === 'ADMIN') {
      setPreviewRole(newRole === 'ADMIN' ? null : newRole);
    }
  }, [currentUser?.role]);

  const value = useMemo(
    () => ({
      // Primary API
      activeDemoUser: currentUser,
      activeDemoRole,
      isDemoSession,
      isAuthenticated: isDemoSession,
      user: currentUser,
      authUser: currentUser,
      activeRole: activeDemoRole,
      accountRole: realRole,
      permissions: currentPermissions,
      previewRole,
      switchRole,
      setPreviewRole,

      // Auth actions
      login,
      logout,
      logoutDemoSession: logout,
      setUser,
      showToast,
      notification,

      // Compat stubs (prototype pages call these, keep them safe)
      IS_DEMO_ENVIRONMENT: false,
      isPreviewMode: Boolean(previewRole),
      demoAccountsRegistry: [],
      studentsList: [],
      selectedStudentId: currentUser?.student_id || currentUser?.id || null,
      switchDemoAccount: () => null,
      loginWithDemoAccount: () => null,
      refreshStudentsCache: async () => {},
    }),
    [
      currentUser,
      activeDemoRole,
      realRole,
      isDemoSession,
      currentPermissions,
      previewRole,
      switchRole,
      login,
      logout,
      setUser,
      showToast,
      notification,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise the user object returned by FastAPI to match the shape the
 * prototype pages expect.
 */
function normaliseUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user.user_id,
    name: user.full_name || user.name || user.email,
    role: (user.role || 'STUDENT').toUpperCase(),
    designation:
      user.designation ||
      user.title ||
      designationForRole((user.role || 'STUDENT').toUpperCase()),
    avatar: user.photo_url || user.avatar || null,
    photo_url: user.photo_url || user.avatar || null,
    department: user.department_name || user.department || '',
  };
}

function designationForRole(role) {
  const map = {
    ADMIN: 'CDC Administrator',
    STAFF: 'Placement Coordinator (TPO)',
    STUDENT: 'Student',
  };
  return map[role] || role;
}
