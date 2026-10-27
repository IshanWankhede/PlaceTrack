# Frontend Architecture

## 1. Dual-Frontend Structure & Source of Truth

The repository contains two frontend directories that serve distinct purposes:

| Attribute | Active Application (`frontend/`) | Historical Prototype (`prototype/`) |
|---|---|---|
| **Role & Purpose** | **Primary production & dev client**, mounted in `docker-compose.yml` on port 5173. | Historical UI/UX prototype exported from Google AI Studio. |
| **Execution Status** | **Integrated and verified.** Built with Vite (0 errors, 41.26s) and running live. | Static reference codebase. Not mounted in Docker. |
| **React Version** | React 18.3.1 | React 19.0.0 |
| **Bundler & Tooling** | Vite 5.4.21 | Vite 8.0.0 |
| **Routing** | React Router DOM 6.26.0 | React Router DOM 7.0.0 |
| **Styling** | Tailwind CSS 3.4.17 + PostCSS + CSS variables | Tailwind CSS 4.0 (`@tailwindcss/vite`) |
| **Backend Connectivity** | Real HTTP REST integration via Axios (`src/services/api.js`) targeting `/api/v1` | Self-contained in-memory arrays in `src/services/mockApi.js` |
| **Authentication** | Real JWT token storage in `localStorage`, sent via `Authorization: Bearer <token>` | Client-side demo role toggle (`placetrack_demo_session_v2`) |

---

## 2. Active Application Architecture (`frontend/`)

### Technology Stack
- **Core Runtime**: React 18.3.1 (`react`, `react-dom`)
- **Build System**: Vite 5.4.21 with `@vitejs/plugin-react`
- **Routing**: `react-router-dom` 6.26.0
- **HTTP Client**: `axios` 1.7.0 with automatic request/response interceptors
- **Icons & Visuals**: `lucide-react`, `recharts`, `framer-motion`, `canvas-confetti`
- **Typography & UI**: Custom dark/light design system with glassmorphic cards and micro-animations

### Directory Structure (`frontend/src/`)
```
frontend/src/
├── assets/             # Static SVGs, logos, illustrations
├── components/
│   ├── charts/         # Recharts wrappers (DepartmentBarChart, PackageHistogram, etc.)
│   ├── common/         # Layout wrappers, RoleProtectedRoute, ThemeToggle
│   ├── three/          # 3D canvas components for landing page hero
│   └── ui/             # Reusable design tokens (Button, Input, Modal, DataTable, GlassCard, etc.)
├── context/
│   ├── AuthContext.jsx # Real JWT authentication state, login/logout, user profile
│   └── ToastContext.jsx# Application-wide toast notifications provider
├── layouts/
│   ├── AuthLayout.jsx  # Split-screen authentication layout
│   └── DashboardLayout.jsx # Collapsible sidebar, header search, notification popover, profile menu
├── pages/
│   ├── auth/           # Login, Signup (OTP verification), ForgotPassword
│   ├── dashboard/      # AdminOverview, StudentOverview, StudentMyApplications, StudentMyPlacement, etc.
│   └── landing/        # Public landing page with 3D workstation hero
├── services/
│   ├── api.js          # Base Axios instance with Bearer token injection
│   ├── authService.js  # /api/v1/auth endpoints
│   ├── studentsService.js # /api/v1/students endpoints
│   ├── companiesService.js# /api/v1/companies endpoints
│   ├── jobsService.js  # /api/v1/jobs endpoints
│   ├── applicationsService.js # /api/v1/applications endpoints
│   ├── offersService.js# /api/v1/offers endpoints
│   ├── notificationsService.js # /api/v1/notifications endpoints
│   ├── analyticsService.js # /api/v1/analytics endpoints
│   └── mockApi.js      # Transitional fallback mocks for unmigrated staff pages
└── theme/              # Color tokens, typography, and animation definitions
```

---

## 3. Data Flow & Service Integration

```
[ User Interaction ]
       │
       ▼
[ Page Component (e.g., StudentMyApplications.jsx) ]
       │
       ▼
[ Service Layer (e.g., applicationsService.getMyApplications()) ]
       │
       ▼
[ Axios Client (api.js) ] ── Interceptor attaches "Authorization: Bearer <JWT>"
       │
       ▼ HTTP GET /api/v1/applications/mine
[ Reverse Proxy (Nginx) / Backend (FastAPI :8000) ]
       │
       ▼ SQL Multi-Table JOIN Query
[ PostgreSQL 16 Database ]
       │
       ▼ JSON Payload (Enriched with job title, company, tier, package, rounds)
[ Page State (`useState`) ] ── Render Responsive Table / Cards
```

### Integration State by Page

| Page | File Path | Data Source | Verified Status |
|---|---|---|---|
| **Landing Page** | `pages/landing/LandingPage.jsx` | Static / 3D Scene | **Integrated and verified** |
| **Login / Signup** | `pages/auth/LoginPage.jsx`, `SignupPage.jsx` | `authService` (`/auth/login`, `/signup/*`) | **Integrated and verified** |
| **Admin Overview** | `pages/dashboard/AdminOverview.jsx` | `analyticsService`, `jobsService`, `studentsService` | **Integrated and verified** |
| **Student Overview** | `pages/dashboard/StudentOverview.jsx` | `jobsService`, `applicationsService`, `offersService` | **Integrated and verified** |
| **Student Applications** | `pages/dashboard/StudentMyApplications.jsx` | `applicationsService.getMyApplications()` | **Integrated and verified** |
| **Student Placement** | `pages/dashboard/StudentMyPlacement.jsx` | `offersService.getMyOffers()`, `placementsService` | **Integrated and verified** |
| **Job Drives (Student)** | `pages/dashboard/StudentJobDrives.jsx` | `jobsService.getJobs()`, `jobsService.getEligibleJobs()` | **Integrated and verified** |
| **Notifications** | `pages/dashboard/NotificationsPage.jsx` | `notificationsService.getNotifications()` | **Integrated and verified** |
| **User Profile** | `pages/dashboard/ProfilePage.jsx` | `authService.getMe()`, `studentsService` | **Integrated and verified** |
| **Staff Interviews** | `pages/dashboard/StaffInterviewsPage.jsx` | `mockApi.js` (Transitional fallback) | **Partially implemented** |
| **Staff Results** | `pages/dashboard/StaffResultsSelectionPage.jsx` | `mockApi.js` (Transitional fallback) | **Partially implemented** |
| **Placement Policies** | `pages/dashboard/PlacementPoliciesPage.jsx` | `mockApi.js` (Transitional fallback) | **Partially implemented** |
| **User Management** | `pages/dashboard/UserManagementPage.jsx` | `mockApi.js` (Transitional fallback) | **Partially implemented** |

---

## 4. Role Isolation & Profile Credentials

In compliance with institutional security and DBMS schema design:
1. **Student Profiles**:
   - Display verified academic attributes: Roll Number, Department, Batch, Verified CGPA, Active Backlogs, Resume URL, and Technical Skills.
2. **Admin & Staff Profiles**:
   - Academic attributes (`cgpa`, `active_backlogs`, `roll_number`) are **strictly excluded**.
   - Profile renders institutional credentials: Full Name, Institutional Email, Role Badge, Designation, and Office/Unit.

---

## 5. Client-Side Routing & Guards

Routes are defined in `src/App.jsx` using React Router DOM v6. Every dashboard route is wrapped with `RoleProtectedRoute`:

```jsx
<Route
  path="/dashboard/analytics"
  element={
    <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
      <AnalyticsPage />
    </RoleProtectedRoute>
  }
/>
```

- If an unauthenticated user attempts to access `/dashboard/*`, they are redirected to `/login`.
- If an authenticated user with an unauthorized role accesses a route (e.g. `STUDENT` navigating to `/dashboard/user-management`), the `RoleProtectedRoute` renders an informative "Access Restricted" panel.
- **Security Boundary Note**: Client route guards provide navigation UX only. Server-side API routes enforce strict role checks via FastAPI dependencies (`require_roles`).
