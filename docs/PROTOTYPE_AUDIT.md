# Prototype Source Audit (Historical File Inventory)

> **Architectural Scope Note:** This audit applies strictly to `prototype/` (the historical Google AI Studio prototype, React 19 / Vite 8 / client mocks), which is preserved in the repository as a UI/UX reference.
> The **active production and development web client** is located in `frontend/` (React 18.3.1 / Vite 5.4.21 / React Router 6.26.0 / Axios 1.7.0), running in Docker on port 5173 and connected to the FastAPI backend.
> For the architecture and status of the active web client, see [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md).

Scope: every file under `prototype/` (the Google AI Studio export, originally `Prototype.zip`). The `.env`, `dist/` and `.aistudio/` folders from the zip were excluded from the copy kept in this repository (see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md), KI-013).


## Root and configuration files

| File | Notes |
|---|---|
| `package.json` | React 19, Vite 8, Tailwind 4 (via @tailwindcss/vite), react-router 7, GSAP, Lenis, three + R3F, Recharts, framer-motion and motion, jsPDF. Declares unused deps: @google/genai, express, dotenv, @hugeicons/*, tsx. Scripts: dev (vite --port=3000 --host=0.0.0.0), build, preview, clean (references missing server.js), lint (tsc --noEmit with no TS sources). |
| `vite.config.ts` | Vite config with React and Tailwind plugins. |
| `tailwind.config.js` | Defines tokens but is **inert**: Tailwind v4 needs `@config`, and `src/index.css` has none. |
| `tsconfig.json` | Present although the source is JSX. |
| `index.html` | Vite HTML shell. |
| `metadata.json` | AI Studio metadata (name still "Remix Remix PlaceTrack"). |
| `README.md` | Stale: says React 18 and 10 dashboard pages; actual is React 19 and 20 dashboard routes. |
| `.env.example` | Placeholder variable names only. |
| `.gitignore` | Ignores node_modules, build, `.env*` (keeps `.env.example`). |
| `package-lock.json, bun.lock` | Two lockfiles from two package managers. |
| `public/` | Static assets (images and media under `public/assets`). |

## Source files (`prototype/src`)

85 files. Status: `used` = imported by at least one other file; `UNUSED` = no importer found.

| File | Lines | Purpose | Status | Imported by | mockApi calls | Review depth |
|---|---|---|---|---|---|---|
| `App.jsx` | 315 | Router and route table (public pages + 20 role-guarded dashboard routes). All pages are imported eagerly (no lazy loading or code splitting). Provider order: AuthProvider > ToastProvider > BrowserRouter. | used | main.jsx |  | read |
| `components/charts/DepartmentBarChart.jsx` | 67 | Recharts chart component. | used | AnalyticsPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/charts/FunnelChart.jsx` | 45 | Recharts chart component. | used | AnalyticsPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/charts/PackageHistogram.jsx` | 61 | Recharts chart component. | used | AnalyticsPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/charts/StatisticsLineChart.jsx` | 158 | Recharts chart component. | used | AdminOverview.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/layout/Footer.jsx` | 39 | Landing footer. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/layout/Navbar.jsx` | 367 | Landing navbar. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/three/AuthScene.jsx` | 115 | React Three Fiber 3D scene element. | used | AuthLayout.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/three/GlassBubble.jsx` | 41 | React Three Fiber 3D scene element. | used | AuthScene.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/three/HeroScene.jsx` | 92 | React Three Fiber 3D scene element. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/three/ScallopBlob.jsx` | 95 | React Three Fiber 3D scene element. | used | AuthScene.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/three/StripedSphere.jsx` | 62 | React Three Fiber 3D scene element. | used | AuthScene.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/three/StudentWorkstation.jsx` | 402 | React Three Fiber 3D scene element. | used | HeroScene.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/ApplicationTimeline.jsx` | 194 | Application stage timeline. | used | ApplicationsPage.jsx, StudentMyApplications.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/Avatar.jsx` | 50 | Avatar/initials primitive. | used | DashboardLayout.jsx, AnalyticsPage.jsx, JobsPage.jsx, StaffEligibleStudentsPage.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/BentoFeatures.jsx` | 176 | Landing feature grid. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/Button.jsx` | 87 | Button primitive. | used | App.jsx, Navbar.jsx, DashboardPreviewSection.jsx, EmptyState.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/CRTWarp.css` | 15 | Stylesheet for the matching component. | used | (via component) |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/CRTWarp.jsx` | 837 | CRT warp effect. | used | DashboardLayout.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/CompanyMarquee.jsx` | 48 | Landing company marquee. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/ContactActionButtons.jsx` | 163 | Call/Message/Email buttons using tel:, mailto: and inbox. | used | ApplicationsPage.jsx, CompaniesPage.jsx, PlacementsPage.jsx, StaffEligibleStudentsPage.jsx ... |  | read |
| `components/ui/CustomCursor.jsx` | 5 | Cursor component; unused (SmoothCursor is used instead). | UNUSED |  |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/DashboardPreviewSection.jsx` | 221 | Landing dashboard preview. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/DataTable.jsx` | 274 | Generic data table. | used | PlacementsPage.jsx, StudentsPage.jsx, UserManagementPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/DemoInboxModal.jsx` | 501 | Simulated inbox modal: conversations, composer, new message; black/white/grey styling. | used | DashboardLayout.jsx | getConversations, getPermittedMessagingContacts, markConversationRead, openOrCreateConversation, sendMessage | partly read + structural checks |
| `components/ui/DomeGallery.css` | 199 | Stylesheet for the matching component. | used | (via component) |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/DomeGallery.jsx` | 655 | Dome image gallery. | used | PlacementHallOfFame.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/EmptyState.jsx` | 32 | Empty-state block; unused. | UNUSED |  |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/GlassCard.jsx` | 61 | Glassmorphism card. | used | BentoFeatures.jsx, DataTable.jsx, HowItWorksSection.jsx, StatCard.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/HeroFloatingCards.jsx` | 124 | Landing hero floating glass cards. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/HowItWorksSection.jsx` | 202 | Landing how-it-works section. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/Input.jsx` | 102 | Form input primitive. | used | DataTable.jsx, DashboardLayout.jsx, AuthPage.jsx, ApplicationsPage.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/Lanyard.css` | 13 | Stylesheet for the matching component. | used | (via component) |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/Lanyard.jsx` | 1293 | 3D lanyard ID card (physics). | used | ProfilePage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/MagneticButton.jsx` | 42 | Magnetic hover button. | used | Button.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/MeetingLinkButton.jsx` | 85 | Join-meeting anchor with link validation. | used | ApplicationsPage.jsx, StaffInterviewsPage.jsx, StudentInterviewsPage.jsx, StudentMyApplications.jsx |  | read |
| `components/ui/Modal.jsx` | 136 | Modal dialog primitive. | used | ApplicationsPage.jsx, CompaniesPage.jsx, JobsPage.jsx, PlacementsPage.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/PlacementHallOfFame.jsx` | 805 | Hall-of-fame gallery section; unused. | UNUSED |  |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/SectionReveal.jsx` | 44 | Scroll reveal wrapper; unused. | UNUSED |  |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/Skeleton.jsx` | 17 | Skeleton loader; unused. | UNUSED |  |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/SmoothCursor.jsx` | 236 | Animated cursor follower. | used | App.jsx, CustomCursor.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/SplitText.jsx` | 60 | GSAP text split/reveal. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/StatCard.jsx` | 75 | Statistic card. | used | AdminOverview.jsx, AnalyticsPage.jsx, StaffEligibleStudentsPage.jsx, StaffResultsSelectionPage.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/StatsBand.jsx` | 74 | Landing stats band. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/StatusBadge.jsx` | 38 | Status pill with colour map. | used | ApplicationsPage.jsx, PlacementsPage.jsx, StaffInterviewsPage.jsx, StaffResultsSelectionPage.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/SwipeToast.css` | 262 | Stylesheet for the matching component. | used | (via component) |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/SwipeToast.jsx` | 322 | Swipeable toast item. | used | ToastContext.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `components/ui/Tabs.jsx` | 62 | Tabs primitive. | used | AdminOverview.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `context/AuthContext.jsx` | 480 | Demo session: activeDemoUser, switchDemoAccount, login/logout, ROLE_PERMISSIONS (partly unused), localStorage session. | used | App.jsx, Navbar.jsx, ContactActionButtons.jsx, DashboardPreviewSection.jsx ... | getStaffAccounts, getStudents | read |
| `context/ToastContext.jsx` | 229 | Single global toast provider (fixed bottom-right), queue, dismissal, dedupe. | used | App.jsx, AuthContext.jsx, DashboardLayout.jsx, ApplicationsPage.jsx ... |  | read |
| `data/mockData.js` | 21 | Older static dataset; not imported anywhere (unused). | UNUSED |  |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `hooks/useLenisScroll.js` | 37 | Lenis smooth-scroll hook wired to GSAP ticker. | used | LandingPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `index.css` | 113 | Tailwind v4 import, font-display class, global scrollbar/toast/layout CSS. | used | (via component) |  | read |
| `layouts/AuthLayout.jsx` | 65 | Split-card layout for sign in / sign up with 3D scene. | used | AuthPage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `layouts/DashboardLayout.jsx` | 1135 | Shared shell: icon sidebar, header, search, demo role selector, notification bell + portal popover, Demo Inbox trigger, profile menu. | used | App.jsx | getCompanies, getConversations, getJobs, getNotifications, getStudents, markNotificationRead ... | partly read + structural checks |
| `main.jsx` | 7 | React entry; mounts App with StrictMode. | entry |  |  | read |
| `pages/AuthPage.jsx` | 1019 | Sign in, student sign up, demo OTP step, forgot password; mock only. | used | App.jsx | login, registerDemoAccount | partly read + structural checks |
| `pages/LandingPage.jsx` | 171 | Marketing landing page (hero, sections, smooth scroll). | used | App.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/AdminOverview.jsx` | 437 | Admin and staff overview (roleVariant) with stats and charts. | used | DashboardRouter.jsx | getAnalytics, getJobs, getStudents | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/AnalyticsPage.jsx` | 242 | Analytics charts (mostly static base data). | used | App.jsx | getAnalytics, getStudents | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/ApplicationsPage.jsx` | 1243 | Staff application board / status changes. | used | App.jsx | createOffer, getApplications, getJobs, scheduleInterview, updateApplicationStatus, updateInterview | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/CompaniesPage.jsx` | 492 | Company directory, create/edit, HR contacts. | used | App.jsx | createCompany, getCompanies, updateCompany | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/DashboardRouter.jsx` | 19 | Picks AdminOverview / Staff view / StudentOverview from active role. | used | App.jsx |  | read |
| `pages/dashboard/JobsPage.jsx` | 2046 | Job drives: staff create/edit/manage; student cards with eligibility checklist and Apply. | used | App.jsx | applyToJob, createJob, getApplications, getInterviews, getJobs, getStudents ... | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/NotificationsPage.jsx` | 544 | Per-user notification list, read state, destinations. | used | App.jsx | getNotifications, markNotificationRead, markNotificationsRead, sendNotification | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/PlacementPoliciesPage.jsx` | 322 | Admin editor for placement policies (most fields not enforced). | used | App.jsx | getPolicies, updatePolicies | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/PlacementsPage.jsx` | 622 | Placements and offers list (admin/staff). | used | App.jsx | createOffer, getJobs, getPlacements, getStudents, updateOfferRecord, updateOfferStatus | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/ProfilePage.jsx` | 715 | Profile for all roles (student academic profile, staff/admin details). | used | App.jsx | updateStudentProfile, updateStudentSkills, updateUserAccount | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StaffEligibleStudentsPage.jsx` | 358 | Staff view of eligible students per drive. | used | App.jsx | getJobs, getStudents, sendNotification | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StaffInterviewsPage.jsx` | 828 | Staff interview scheduling and results. | used | App.jsx | cancelInterview, getApplications, getInterviews, scheduleInterview, updateInterview | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StaffResultsSelectionPage.jsx` | 406 | Selection, rejection and offer release. | used | App.jsx | createOffer, getApplications, getInterviews, updateApplicationStatus | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StudentInterviewsPage.jsx` | 373 | Student interview schedule with meeting-link actions. | used | App.jsx | getApplications, getInterviews | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StudentMyApplications.jsx` | 624 | Student application cards and filters; read-only tracking (no withdraw action). | used | App.jsx | getApplications | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StudentMyPlacement.jsx` | 547 | Offers, accept/decline, offer PDF, ID badge (route also serves /my-offers). | used | App.jsx | getOffers, getPolicies, updateOfferStatus | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StudentOverview.jsx` | 221 | Student home: progress, applications, interviews, quick links. | used | DashboardRouter.jsx | getApplications, getJobs, getOffers | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StudentProgressPage.jsx` | 236 | Student placement progress timeline. | used | App.jsx | getApplications, getJobs, getOffers, getPolicies | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StudentSettingsPage.jsx` | 225 | Student settings (local) and a Reset demo data action. | used | App.jsx | getStudentSettings, resetDemoData, updateStudentSettings | structural survey (imports, exports, API calls, greps); body not read line by line |
| `pages/dashboard/StudentsPage.jsx` | 594 | Student directory with filters, detail view, CSV export, verification, promotion. | used | App.jsx | getStudents, promoteStudentsToNextRound, toggleStudentCgpaVerified, updateStudentSkills | partly read + structural checks |
| `pages/dashboard/UserManagementPage.jsx` | 596 | Admin staff/user account management. | used | App.jsx | createUserAccount, getStaffAccounts, getStudents, toggleUserAccountStatus, updateUserAccount | structural survey (imports, exports, API calls, greps); body not read line by line |
| `services/eligibility.js` | 169 | Client eligibility engine: CGPA, backlogs, department, skills, verification; match percentage. | used | JobsPage.jsx, ProfilePage.jsx, StaffEligibleStudentsPage.jsx, StudentOverview.jsx ... |  | read |
| `services/mockApi.js` | 5305 | In-browser mock backend: seed data, 51 async methods, localStorage persistence, notification and messaging logic. | used | DemoInboxModal.jsx, AuthContext.jsx, mockData.js, DashboardLayout.jsx ... |  | partly read + structural checks |
| `theme/tokens.js` | 185 | Design tokens; only StatusBadge imports it (tailwind.config.js is inert under Tailwind v4). | used | StatusBadge.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `utils/idBadgeGenerator.js` | 332 | UI component. | used | ProfilePage.jsx |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `utils/interactionHelpers.js` | 185 | tel:/mailto:/meeting link helpers and validation. | used | ContactActionButtons.jsx, MeetingLinkButton.jsx, ApplicationsPage.jsx, ProfilePage.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |
| `utils/offerPdfGenerator.js` | 341 | Offer letter PDF via jsPDF. | used | ApplicationsPage.jsx, PlacementsPage.jsx, ProfilePage.jsx, StudentMyPlacement.jsx ... |  | structural survey (imports, exports, API calls, greps); body not read line by line |

## Unused source files

- `src/components/ui/CustomCursor.jsx`
- `src/components/ui/EmptyState.jsx`
- `src/components/ui/PlacementHallOfFame.jsx`
- `src/components/ui/SectionReveal.jsx`
- `src/components/ui/Skeleton.jsx`
- `src/data/mockData.js`

## Cross-checks performed (scripted)

- Every relative import resolves to an existing file: **no unresolved imports**.
- Every `mockApi.<method>` called from UI code exists in `mockApi.js`: **no missing methods**. Defined but never called from UI: `getApplicationById`, `getDemoAccounts`, `getJobById`, `getStudentById`.
- Every named import from `mockApi`, `eligibility`, `interactionHelpers`, `AuthContext` and `ToastContext` is exported: **none missing**.
- Not performed: build, lint, runtime execution, browser testing.

