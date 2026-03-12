# Chime Next – Developer Onboarding & Quick Start

Welcome! This guide helps you understand the refactored fintech architecture and get productive immediately.

## 📊 What You're Looking At

You've inherited a **production-ready fintech web app** built from a Figma design. The original static UI is now a fully scalable, enterprise-grade application with:

- ✅ Clean separation of concerns (UI components, services, state)
- ✅ Type-safe codebase (TypeScript strict mode)
- ✅ Centralized state management (Redux Toolkit + React Context)
- ✅ Secure API abstraction (token injection, error handling)
- ✅ Role-based access control (user/admin routes)
- ✅ Production security hardening (CSRF, XSS protection, rate limiting)
- ✅ Admin control center (user management, fraud detection, KYC, reports)
- ✅ Comprehensive documentation (architecture, security, API integration)

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your API endpoint:
# VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
# Navigate to http://localhost:5173
```

### 4. Demo Credentials
```
User:
  Email: any@example.com
  Password: any

Admin:
  Email: admin@chime.com
  Password: any
```

## 📁 Where to Look

| I want to... | Go to... |
|------|----------|
| Understand the big picture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Build a new feature | [features/](./src/features/) |
| Add API endpoints | [API_INTEGRATION.md](./API_INTEGRATION.md) |
| Manage admin features | [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) |
| Secure the app | [SECURITY.md](./SECURITY.md) |
| Check available hooks | [hooks/](./src/hooks/) |
| Use reusable components | [components/base/](./src/components/base/) |
| View global types | [types/](./src/types/) |
| Handle auth | [context/AuthProvider.tsx](./src/context/AuthProvider.tsx) |

## 🎯 Common Tasks

### Add a New Page

```tsx
// 1. Create component
// src/app/components/myfeature/MyPage.tsx
export default function MyPage() {
  return <div>My Page</div>;
}

// 2. Add route
// src/app/App.tsx
<Route path="/my-page" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />

// 3. Add navigation link
<button onClick={() => navigate('/my-page')}>Go to My Page</button>
```

### Call an API Endpoint

```tsx
// 1. Create service
// src/features/myfeature/services/myService.ts
export const myService = {
  getData: async () => {
    const res = await apiClient.get('/my-endpoint');
    return res.data;
  },
};

// 2. Use in component
import { useAsync } from '../../../hooks/useAsync';
import { myService } from '../services/myService';

function MyComponent() {
  const { data, loading, error, execute } = useAsync(myService.getData);
  
  return <button onClick={() => execute()}>Load Data</button>;
}
```

### Add Form Validation

```tsx
// 1. Create Zod schema
// src/lib/formValidation.ts
export const MyFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// 2. Use in form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function MyForm() {
  const { register, formState: { errors }, handleSubmit } = useForm({
    resolver: zodResolver(MyFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

### Show Toast Notification

```tsx
import { useToast } from '../context/ToastProvider';

function MyComponent() {
  const { addToast } = useToast();

  return (
    <button onClick={() => addToast('success', 'Operation successful!')}>
      Click me
    </button>
  );
}
```

### Protect Admin Route

```tsx
// src/app/App.tsx
<Route
  path="/admin/users"
  element={
    <AdminRoute>
      <AdminUsers />
    </AdminRoute>
  }
/>
```

## 🔐 Security Reminders

- ✅ **Input validation**: Use Zod schemas on all forms
- ✅ **No raw fetch**: Always use services
- ✅ **No secrets in code**: Use .env.local
- ✅ **No console logs**: Use logging service
- ✅ **No prop drilling**: Use Redux/Context
- ✅ **Type everything**: Enable TypeScript strict mode

## 📈 Development Workflow

```
1. Read ARCHITECTURE.md (big picture)
   ↓
2. Create feature folder: src/features/featureName/
   ├── services/        (API calls)
   ├── hooks/          (custom logic)
   ├── types/          (TypeScript types)
   └── components/     (UI)
   ↓
3. Create service: apiClient + type validation
   ↓
4. Create hook: wrap service with state management
   ↓
5. Create component: use hook + render UI
   ↓
6. Add route: src/app/App.tsx
   ↓
7. Wrap with guard: <ProtectedRoute> or <AdminRoute>
   ↓
8. Test: npm run dev
```

## 🧪 Testing

### Type Checking
```bash
npm run build  # Catches TypeScript errors
```

### Visual Testing
```bash
npm run dev
# Navigate through all pages manually
```

### API Integration Testing
```bash
# Test with mock API or Postman
# See API_INTEGRATION.md for examples
```

## 📚 Key Concepts

### Redux Store
```ts
// Centralized auth state
import { useSelector, useDispatch } from 'react-redux';
const token = useSelector((state) => state.auth.token);
const dispatch = useDispatch();
dispatch(setCredentials({ token, user }));
```

### Context API
```ts
// User-facing auth methods
const { isAuthenticated, user, login, logout } = useAuthContext();
```

### Feature Modules
```
Each domain (auth, transactions, admin) is self-contained:
features/auth/
  ├── services/authService.ts
  ├── hooks/useAuth.ts
  ├── types/index.ts
  └── components/...
```

### Type Safety
```ts
// Global types in src/types/
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Feature response types
const data = await service.getData(); // Strongly typed
```

## 🚨 Common Issues & Fixes

### Token not injecting to requests
→ Check `src/lib/apiClient.ts` interceptor is in place

### Routes showing login instead of component
→ Ensure `<ProtectedRoute>` wraps component

### Env variables showing as undefined
→ Restart dev server after changing `.env.local`

### TypeScript errors not showing
→ Run `npm run build` to see all errors

### AdminRoute not working
→ Check user.role is set by backend (admin@chime.com demo sets it)

## 🎓 Next Steps

1. **Review ARCHITECTURE.md** (10 min)
   - Understand layer breakdown
   - Learn data flow patterns
   
2. **Explore src/ structure** (5 min)
   - Get familiar with folder layout
   
3. **Read API_INTEGRATION.md** (10 min)
   - Learn how to call APIs
   - Understand service pattern
   
4. **Check SECURITY.md** (5 min)
   - Know what to do and not do
   
5. **Check ADMIN_GUIDE.md** (10 min)
   - Understand admin features and permissions
   
6. **Build first feature** (30 min)
   - Pick a small task
   - Follow workflow above
   - Test with `npm run dev`

## 📞 Questions?

Refer to the docs:
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **APIs**: [API_INTEGRATION.md](./API_INTEGRATION.md)
- **Admin**: [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **Security**: [SECURITY.md](./SECURITY.md)

---

**Happy coding! 🚀**
