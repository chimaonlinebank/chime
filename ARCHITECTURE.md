# Architecture Overview – Chime Next

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    React + TypeScript                        │
│                  (Vite + TailwindCSS)                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐        ┌─────▼────┐
   │  Redux   │        │  Context │
   │ Toolkit  │        │ Providers│
   │(auth)    │        │(Auth,Tx) │
   └────┬─────┘        └─────┬────┘
        │                    │
        └────────┬───────────┘
                 │
        ┌────────▼────────┐
        │  Components     │
        │  (UI Layers)    │
        └────────┬────────┘
                 │
        ┌────────▼────────────┐
        │  Service Layer      │
        │  (API abstractors)  │
        └────────┬────────────┘
                 │
        ┌────────▼──────────────┐
        │  API Client Layer     │
        │  (Axios + interceptor)│
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │  Backend REST API     │
        │  (Node/Express/etc)   │
        └───────────────────────┘
```

## Layer Breakdown

### 1. UI Layer (`src/app/components/`, `src/components/`)

**Responsibilities:**
- Render visual interface (inherited from Figma)
- Dispatch actions to Redux / Context
- Call hooks for state & async logic
- No direct API calls
- No business logic

**Components:**
- Page components: `Login`, `Dashboard`, `AdminDashboard`, etc.
- Shared components: `Card`, `Button`, `Input`, etc.
- Tables: `DataTable`, `TablePagination`, `TableFilter`

**Pattern:**
```tsx
function Dashboard() {
  const { isAuthenticated } = useAuthContext();
  const { account, fetchBalance } = useAccount();
  
  useEffect(() => {
    fetchBalance();
  }, []);
  
  return <div>{/* render account.balance */}</div>;
}
```

### 2. State Management Layer

#### Redux Toolkit (`src/store/`)

**What it stores:**
- Auth state (token, user, isAuthenticated)
- Could expand: transactions, account balance, UI toggles

**Slice example:**
```ts
// src/store/slices/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null, isAuthenticated: false },
  reducers: {
    setCredentials(state, action) { /* ... */ },
    clearCredentials(state) { /* ... */ },
  },
});
```

#### Context (`src/context/`)

**AuthProvider:**
- Hydrates Redux on app start (from localStorage)
- Provides login/logout actions
- Wraps app at root

**ToastProvider:**
- Global toast notifications
- Non-blocking user feedback

### 3. Service Layer (`src/features/*/services/`)

**Responsibilities:**
- Encapsulate API calls
- Map backend responses to types
- Handle pagination, filters
- No component logic

**Example:**
```ts
// src/features/transactions/services/transactionService.ts
export const transactionService = {
  getTransactions(limit, offset) {
    return apiClient.get('/transactions', { params: { limit, offset } });
  },
  
  sendMoney(recipientEmail, amount) {
    return apiClient.post('/transactions/send', { recipientEmail, amount });
  },
};
```

### 4. API Client Layer (`src/lib/apiClient.ts`)

**Responsibilities:**
- Single Axios instance (baseURL, headers)
- Request interceptor (token injection)
- Response interceptor (error handling)
- Error backpropagation

**Pattern:**
```ts
const apiClient = axios.create({ baseURL: ENV.VITE_API_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth.token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Log errors, refresh token if 401, etc.
    return Promise.reject(error);
  }
);
```

### 5. Route & Guard Layer (`src/routes/`)

**ProtectedRoute:**
- Checks `isAuthenticated`
- Redirects to `/login` if false
- Used for user pages

**AdminRoute:**
- Checks `isAuthenticated` AND `user.role === 'admin'`
- Redirects to `/login` if false
- Redirects to `/` if not admin

**Pattern:**
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 6. Utilities & Helpers

**Type Safety** (`src/types/`):
```ts
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}
```

**Form Validation** (`src/lib/formValidation.ts`):
```ts
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

**Security** (`src/lib/security.ts`):
```ts
export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}
```

**Async Hook** (`src/hooks/useAsync.ts`):
```ts
const { data, loading, error, execute } = useAsync(
  () => service.fetch(),
  []
);
```

## Data Flow Examples

### ✅ Login Flow

```
1. User fills form → Component state
2. Form submitted → validateInput() + handleLogin()
3. handleLogin() calls → authService.login(email, password)
4. authService calls → apiClient.post('/auth/login')
5. apiClient injects token in req
6. Response returns {token, user}
7. Component calls → login(token, user)
8. AuthProvider.login() saves to localStorage + Redux
9. Redux updates store
10. ProtectedRoute checks isAuthenticated → allows /dashboard
11. Navigation to /dashboard
```

### ✅ Send Money Flow

```
1. User fills SendMoney form
2. Form validated via Zod schema
3. handleSubmit calls → transactionService.sendMoney(email, amount)
4. Service calls → apiClient.post('/transactions/send', payload)
5. Interceptor adds Authorization header
6. Backend processes, returns transaction receipt
7. Component receives response → dispatch action
8. Call useAccount().fetchBalance() to refresh
9. Show toast success → redirect to /activity
```

### ✅ Admin View Users Flow

```
1. Admin opens /admin/users
2. AdminRoute checks role → passes
3. AdminUsers component mounts
4. useEffect calls → adminService.getUsers()
5. apiClient.get('/admin/users') + token injection
6. Response includes list of users
7. Component renders DataTable with users
8. Admin clicks filter → onFilterChange() reruns query
9. Results update with search/filter params
```

## Error Handling Cascade

```
Component Error
    ↓
Try/Catch in service
    ↓
Response interceptor in apiClient
    ↓
Component handles error + displays toast
    ↓
If uncaught → ErrorBoundary catches + fallback UI
    ↓
If navigation error → 404/500 page
```

## State Management Decision Tree

```
Is it UI state (modal open/close, sidebar toggle)?
  ├─ Yes → useState
  
Is it auth state (user, token)?
  ├─ Yes → Redux + Context
  
Is it page data (transactions, users)?
  ├─ Yes → Component state + useAsync hook
  
Is it global notification?
  ├─ Yes → ToastProvider
```

## Dependency Map

```
main.tsx
  ↓
ErrorBoundary
  ↓
Redux Provider
  ↓
AuthProvider
  ↓
ToastProvider
  ↓
App (routing)
  ↓
Pages / Components
  ↓
Hooks (useAuth, useAsync, useToast)
  ↓
Services (authService, transactionService, etc.)
  ↓
apiClient
  ↓
Backend REST API
```

## Scalability Patterns

### Adding a New Feature

1. Create feature folder: `src/features/newFeature/`
2. Create service: `src/features/newFeature/services/newFeatureService.ts`
3. Create hook (if needed): `src/features/newFeature/hooks/useNewFeature.ts`
4. Create types: `src/features/newFeature/types/index.ts`
5. Create component in `src/app/components/`
6. Add routes to `src/app/App.tsx`
7. If auth-controlled, wrap with `<ProtectedRoute>` or `<AdminRoute>`

### Adding Redux State

1. Create slice: `src/store/slices/newSlice.ts`
2. Register in `src/store/index.ts`
3. Use in component: `const dispatch = useDispatch(); dispatch(action())`
4. Type with `RootState` and `AppDispatch`

### Adding API Endpoints

1. Add method to relevant service
2. No changes needed to apiClient (auto-handles token)
3. Update types if response shape changed
4. Test in component

## Performance Optimizations

- **Code splitting:** Lazy load feature routes
- **Memoization:** Wrap expensive components with `React.memo()`
- **useMemo/useCallback:** Prevent unnecessary recalculations
- **Image optimization:** Use WebP, compress, lazy load
- **Bundle analysis:** `npm run build` and check `dist/`

## Testing Strategy

| Layer | Tool | Focus |
|-------|------|-------|
| Unit | Vitest / Jest | Utils, hooks, schemas |
| Integration | Cypress | User flows, API mocking |
| E2E | Playwright | Full auth, admin, transactions |
| Type | TypeScript | Compile-time safety |

---

**Example test structure:**
```
src/
├── features/transactions/
│   ├── services/
│   │   ├── transactionService.ts
│   │   └── transactionService.test.ts  ← unit test
│   └── hooks/
│       ├── useTransactions.ts
│       └── useTransactions.test.ts
```

## Monitoring & Logging

**Recommended integrations:**
- **Error tracking:** Sentry, LogRocket
- **Analytics:** Mixpanel, Segment
- **Performance:** DataDog, New Relic
- **Logging:** Winston, Pino (backend), console (frontend)

**Add to apiClient interceptor:**
```ts
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Send to Sentry
    Sentry.captureException(error);
    return Promise.reject(error);
  }
);
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-20