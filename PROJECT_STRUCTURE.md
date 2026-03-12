# Project Structure Overview

```
chime/                                    # Root directory
│
├── node_modules/                         # Dependencies
├── dist/                                 # Production build output
│
├── src/                                  # Source code
│   │
│   ├── main.tsx                          # App entry point (Redux + Auth + Toast + ErrorBoundary)
│   │
│   ├── app/                              # Main application shell
│   │   ├── App.tsx                       # Route definitions with ProtectedRoute wrappers
│   │   └── components/                   # Page-level & feature components
│   │       ├── auth/                     # Auth pages (Login, Register, KYC)
│   │       ├── user/                     # User pages (Dashboard, Activity, Profile)
│   │       ├── admin/                    # Admin pages (Users, Transactions, KYC, etc.)
│   │       ├── ui/                       # Shadcn UI components (25+ ready-made)
│   │       ├── figma/                    # Figma-specific components
│   │       └── ...                       # Other shared components
│   │
│   ├── features/                         # Domain-driven feature modules
│   │   ├── auth/                         # Authentication feature
│   │   │   ├── services/
│   │   │   │   └── authService.ts        # login, register, logout, refreshToken
│   │   │   ├── types/
│   │   │   │   └── index.ts              # Auth-specific types
│   │   │   └── hooks/                    # (optional) useAuth.ts
│   │   │
│   │   ├── account/                      # Account & balance management
│   │   │   ├── services/
│   │   │   │   └── accountService.ts     # getBalance, addMoney, withdraw
│   │   │   ├── hooks/
│   │   │   │   └── useAccount.ts         # State wrapper around service
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── transactions/                 # Transaction & money transfer
│   │   │   ├── services/
│   │   │   │   └── transactionService.ts # getTransactions, sendMoney
│   │   │   ├── hooks/
│   │   │   │   └── useTransactions.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── user/                         # User profile & activity
│   │   │   ├── services/
│   │   │   │   └── userService.ts        # getProfile, updateProfile, getActivity
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   └── admin/                        # Admin control center
│   │       ├── services/
│   │       │   └── adminService.ts       # getUsers, getTransactions, getKYC, etc.
│   │       └── types/
│   │           └── index.ts
│   │
│   ├── components/                       # Shared/reusable UI components
│   │   ├── base/                         # Design system
│   │   │   └── index.ts                  # Card, SectionWrapper, LayoutContainer, StatusBadge
│   │   ├── tables/                       # Table utilities
│   │   │   ├── DataTable.tsx             # Paginated table component
│   │   │   ├── TablePagination.tsx       # Pagination controls
│   │   │   └── TableFilter.tsx           # Search & filter bar
│   │   └── ui/                           # Shadcn UI library (25+ components already present)
│   │
│   ├── hooks/                            # Global custom hooks
│   │   └── useAsync.ts                   # Standardized async state (data, loading, error, execute)
│   │
│   ├── context/                          # React Context providers
│   │   ├── AuthProvider.tsx              # Authentication context (login, logout, user state)
│   │   └── ToastProvider.tsx             # Toast notification context
│   │
│   ├── store/                            # Redux Toolkit state management
│   │   ├── index.ts                      # Store configuration with RootState & AppDispatch types
│   │   └── slices/
│   │       └── authSlice.ts              # Auth reducer (setCredentials, clearCredentials, setUser)
│   │
│   ├── lib/                              # Core utilities & helpers
│   │   ├── apiClient.ts                  # Axios instance with request/response interceptors
│   │   ├── ErrorBoundary.tsx             # Global React ErrorBoundary
│   │   ├── security.ts                   # Input sanitization, token storage, rate limiting
│   │   └── formValidation.ts             # Zod schemas (LoginSchema, RegisterSchema, SendMoneySchema)
│   │
│   ├── config/                           # Configuration & environment
│   │   ├── env.ts                        # Environment variable validation (fails safely)
│   │   └── theme.ts                      # Design tokens (colors, spacing, typography, elevation)
│   │
│   ├── types/                            # Global TypeScript types
│   │   └── index.ts                      # User, Account, Transaction, AuthState, etc.
│   │
│   ├── routes/                           # Routing utilities
│   │   └── ProtectedRoute.tsx            # ProtectedRoute (auth guard) & AdminRoute (role guard)
│   │
│   ├── pages/                            # Error pages & special routes
│   │   ├── NotFound.tsx                  # 404 page
│   │   └── ServerError.tsx               # 500 error page
│   │
│   └── styles/                           # Global CSS
│       ├── index.css                     # Main styles
│       ├── fonts.css                     # Font definitions
│       ├── tailwind.css                  # Tailwind imports
│       └── theme.css                     # Theme overrides
│
├── public/                               # Static assets
│   └── vite.svg
│
├── .env.example                          # Environment variables template
├── .env.local                            # Local environment overrides (gitignored)
├── .gitignore                            # Git ignore rules
├── package.json                          # Dependencies & scripts
├── package-lock.json                     # Locked dependency versions
├── vite.config.ts                        # Vite build configuration
├── index.html                            # HTML entry point
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.js                    # Tailwind CSS configuration
├── postcss.config.mjs                    # PostCSS configuration
│
└── Documentation/
    ├── README.md                         # 🎯 Quick start & feature overview
    ├── COMPLETION_REPORT.md              # ✅ Refactoring completion status
    ├── ARCHITECTURE.md                   # 🏗️ System design & patterns
    ├── ADMIN_GUIDE.md                    # 👥 Admin dashboard & features
    ├── API_INTEGRATION.md                # 🔌 How to build services & integrate APIs
    ├── SECURITY.md                       # 🔐 Security best practices
    └── ONBOARDING.md                     # 🚀 Developer onboarding guide
```

---

## 📊 File Type Distribution

```
TypeScript/TSX:     50+ files     (logic, components, types)
CSS/Tailwind:       5 files       (styles)
JSON:               3 files       (config, package)
Markdown:           6 files       (documentation)
HTML:               1 file        (index.html)
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / DOM                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  React App     │
                    │  (main.tsx)    │
                    │ ErrorBoundary  │
                    │ Redux Provider │
                    │ AuthProvider   │
                    │ ToastProvider  │
                    └───────┬────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
        ┌───────▼──────┐    │    ┌──────▼────────┐
        │  Components  │    │    │  Redux Store  │
        │  (UI Layer)  │    │    │  (auth slice) │
        └───────┬──────┘    │    └───────────────┘
                │           │
        ┌───────▼──────────────────┐
        │  Hooks                   │
        │ useAuth, useAsync,       │
        │ useAccount, useToast     │
        └───────┬──────────────────┘
                │
        ┌───────▼──────────────────┐
        │  Services                │
        │ (Feature modules)        │
        │ authService,             │
        │ transactionService, etc. │
        └───────┬──────────────────┘
                │
        ┌───────▼──────────────────┐
        │  API Client (Axios)      │
        │  - Token injection       │
        │  - Error handling        │
        │  - Request/Response      │
        │    interceptors          │
        └───────┬──────────────────┘
                │
        ┌───────▼──────────────────┐
        │  Backend REST API        │
        │  /auth                   │
        │  /account                │
        │  /transactions           │
        │  /admin                  │
        └──────────────────────────┘
```

---

## 🎯 Feature Module Template

Every feature follows this structure:

```
features/[featureName]/
├── services/
│   └── [featureName]Service.ts          # API calls
│       export const [featureName]Service = {
│         getData: async () => { /* */ },
│         postData: async (data) => { /* */ },
│         // ...
│       }
├── hooks/
│   └── use[FeatureName].ts               # State wrapper
│       export function use[FeatureName]() {
│         const [data, setData] = useState();
│         const [loading, setLoading] = useState();
│         const fetch = useCallback(async () => { /* */ });
│         return { data, loading, fetch };
│       }
├── types/
│   └── index.ts                          # TypeScript interfaces
│       export interface [FeatureName]Type { }
└── components/                           # (optional) UI components
    └── [FeatureName]Component.tsx
```

---

## 🔌 Integration Points

### With Backend
- `src/lib/apiClient.ts` → Backend REST API
- All API calls pipe through centralized Axios client
- Token auto-injected via request interceptor

### With State
- Redux for auth state (`src/store/`)
- Context for auth methods (`src/context/AuthProvider.tsx`)
- Component state via hooks

### With UI Library
- Shadcn UI components already in place
- Design system in `src/components/base/`
- TailwindCSS for styling

---

## 📈 How to Navigate

**Need to...** | **Go to...**
---|---
Add a new page | `src/app/components/` → Create component → Add route in `App.tsx`
Call an API | `src/features/[feature]/services/` → Define service → Import in component
Add global state | `src/store/slices/` → Create slice → Use with Redux hooks
Use auth | `src/context/AuthProvider.tsx` → `useAuthContext()` hook
Show notifications | `src/context/ToastProvider.tsx` → `useToast()` hook
Handle errors | `src/lib/ErrorBoundary.tsx` → Already wraps app
Validate forms | `src/lib/formValidation.ts` → Add Zod schema → Use with React Hook Form
Secure input | `src/lib/security.ts` → `sanitizeInput()`, token utils

---

## ✨ Key Entry Points

| File | Purpose |
|------|---------|
| `src/main.tsx` | App bootstrap (providers) |
| `src/app/App.tsx` | Route definitions |
| `src/lib/apiClient.ts` | API communication |
| `src/context/AuthProvider.tsx` | Auth management |
| `src/store/index.ts` | Redux store |
| `src/lib/ErrorBoundary.tsx` | Error handling |
| `src/config/env.ts` | Config validation |

---

**This structure supports rapid feature development while maintaining clean separation of concerns, type safety, and security hardening.**
