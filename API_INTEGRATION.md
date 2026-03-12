# API Integration Guide

## Base Setup

All API calls go through a **centralized Axios instance** (`src/lib/apiClient.ts`) that:

1. Sets the base URL from `VITE_API_URL` env
2. Injects auth token automatically (request interceptor)
3. Handles errors centrally (response interceptor)
4. No component makes raw fetch/axios calls

## Creating a Service

### Step 1: Define Types

```ts
// src/features/newFeature/types/index.ts
export interface NewResource {
  id: string;
  name: string;
  // ...
}
```

### Step 2: Create Service

```ts
// src/features/newFeature/services/newFeatureService.ts
import apiClient from '../../../lib/apiClient';
import { NewResource } from '../types';

export const newFeatureService = {
  // GET all
  getResources: async (filters?: Record<string, any>) => {
    const res = await apiClient.get('/new-feature', { params: filters });
    return res.data as { items: NewResource[]; total: number };
  },

  // GET one
  getResource: async (id: string) => {
    const res = await apiClient.get(`/new-feature/${id}`);
    return res.data as NewResource;
  },

  // POST (create)
  createResource: async (data: Partial<NewResource>) => {
    const res = await apiClient.post('/new-feature', data);
    return res.data as NewResource;
  },

  // PUT (update)
  updateResource: async (id: string, data: Partial<NewResource>) => {
    const res = await apiClient.put(`/new-feature/${id}`, data);
    return res.data as NewResource;
  },

  // DELETE
  deleteResource: async (id: string) => {
    await apiClient.delete(`/new-feature/${id}`);
  },
};
```

### Step 3: Use in Component

```tsx
// Option A: Direct service call
const handleFetch = async () => {
  const { items } = await newFeatureService.getResources();
  setData(items);
};

// Option B: With useAsync hook
const { data, loading, error, execute } = useAsync(
  () => newFeatureService.getResources(),
  []
);
```

## API Interceptors

### Request Interceptor (Token Injection)

Runs **before** every request:

```ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth.token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

**Result:** All requests include `Authorization: Bearer <token>` header.

### Response Interceptor (Error Handling)

Runs on **success or error**:

```ts
apiClient.interceptors.response.use(
  (res) => res,  // Success: pass through
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired: refresh or logout
    }
    if (error.response?.status === 403) {
      // Unauthorized (admin-only)
    }
    if (error.response?.status === 500) {
      // Server error: log and notify
    }
    return Promise.reject(error);
  }
);
```

## Common Patterns

### Listing with Pagination

```ts
// Service
export const userService = {
  getUsers: async (page = 1, limit = 20) => {
    const res = await apiClient.get('/users', {
      params: { page, limit }
    });
    return res.data;
  },
};

// Component
const [page, setPage] = useState(1);
const { data, loading } = useAsync(
  () => userService.getUsers(page),
  [page]
);

<DataTable
  data={data?.items}
  isLoading={loading}
/>
<TablePagination
  currentPage={page}
  totalPages={data?.totalPages}
  onPageChange={setPage}
/>
```

### Filtering & Search

```ts
const [filters, setFilters] = useState({ search: '', status: 'all' });
const { data } = useAsync(
  () => adminService.getUsers(filters),
  [filters]
);

const handleSearch = (query) => {
  setFilters(prev => ({ ...prev, search: query }));
};

<TableFilter onSearch={handleSearch} />
```

### Form Submission

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendMoneySchema } from '../../../lib/formValidation';

function SendMoneyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(SendMoneySchema),
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await transactionService.sendMoney(
        data.recipientEmail,
        data.amount,
        data.description
      );
      addToast('success', 'Money sent!');
      // Redirect or reset form
    } catch (err) {
      addToast('error', err.response?.data?.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('recipientEmail')} />
      {errors.recipientEmail && <span>{errors.recipientEmail.message}</span>}
      <button disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
    </form>
  );
}
```

## API Response Format

**Expected backend response format:**

### Success (2xx)
```json
{
  "success": true,
  "data": { /* resource or list */ },
  "message": "Optional message"
}
```

Or directly return data (Axios auto-wraps):
```json
{
  "id": "123",
  "email": "user@example.com"
}
```

### Error (4xx, 5xx)
```json
{
  "success": false,
  "error": "Error code",
  "message": "Human-readable message",
  "details": { /* optional validation errors */ }
}
```

### Paginated Response
```json
{
  "items": [ { /* resources */ } ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

## Error Handling

### In Component

```tsx
try {
  const result = await transactionService.sendMoney(...);
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error
    addToast('error', error.response.data.message);
  } else if (error.response?.status === 401) {
    // Unauthorized: logout user
    logout();
  } else if (error.response?.status === 500) {
    // Server error
    addToast('error', 'Server error, please try again later');
  } else {
    addToast('error', 'Network error');
  }
}
```

### In Interceptor

```ts
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const { status, data } = error.response || {};
    
    if (status === 401) {
      // Token invalid: refresh or logout
      // const newToken = await refreshToken();
    }
    
    if (status >= 500) {
      // Server error: log to Sentry
      // Sentry.captureException(error);
    }
    
    return Promise.reject({
      status,
      message: data?.message || 'An error occurred',
      data,
    });
  }
);
```

## Authentication Endpoints

### Login

```ts
POST /auth/login
Body: { email, password }
Response: { token, user: { id, email, role } }

// Usage
const { token, user } = await authService.login(email, password);
login(token, user);  // Save to Redux + localStorage
```

### Register

```ts
POST /auth/register
Body: { fullName, email, phone, password }
Response: { user: { id, email } }

// Usage
await authService.register(fullName, email, phone, password);
navigate('/kyc');
```

### Logout

```ts
POST /auth/logout (or GET /auth/logout)
Headers: Authorization: Bearer <token>
Response: { success: true }

// Usage
await authService.logout();
logout();  // Clear Redux + localStorage
navigate('/login');
```

### Refresh Token

```ts
POST /auth/refresh
Headers: Authorization: Bearer <token>
Response: { token: <new_token> }

// Usage in interceptor
if (status === 401) {
  const { token: newToken } = await apiClient.post('/auth/refresh');
  localStorage.setItem('auth.token', newToken);
  // Retry original request with new token
}
```

## User Endpoints

### Get Profile

```ts
GET /user/profile
Headers: Authorization: Bearer <token>
Response: { id, email, name, role, ... }
```

### Update Profile

```ts
PUT /user/profile
Headers: Authorization: Bearer <token>
Body: { name, avatar, ... }
Response: { id, email, ... }
```

### Get Activity

```ts
GET /user/activity?limit=20&offset=0
Headers: Authorization: Bearer <token>
Response: { items: [...], total: 100 }
```

## Account Endpoints

### Get Balance

```ts
GET /account/balance
Headers: Authorization: Bearer <token>
Response: { id, balance, currency }
```

### Deposit (Add Money)

```ts
POST /account/deposit
Headers: Authorization: Bearer <token>
Body: { amount, method }  // method: 'card', 'bank', etc.
Response: { transactionId, status, amount }
```

### Withdraw

```ts
POST /account/withdraw
Headers: Authorization: Bearer <token>
Body: { amount, destination }
Response: { transactionId, status, amount }
```

## Transaction Endpoints

### Get Transactions

```ts
GET /transactions?page=1&limit=20
Headers: Authorization: Bearer <token>
Response: { items: [...], total: 100, page: 1, limit: 20 }
```

### Send Money

```ts
POST /transactions/send
Headers: Authorization: Bearer <token>
Body: { recipientEmail, amount, description? }
Response: { transactionId, status, amount, recipient }
```

### Get Transaction Details

```ts
GET /transactions/:id
Headers: Authorization: Bearer <token>
Response: { id, amount, type, date, recipient, ... }
```

## Admin Endpoints

See `ADMIN_GUIDE.md` for complete admin API reference.

### Get Users

```ts
GET /admin/users?search=&role=&status=&page=1
Headers: Authorization: Bearer <token>, X-Admin-Role: true
Response: { items: [...], total: 100 }
```

### Get Transactions

```ts
GET /admin/transactions?fromDate=&toDate=&minAmount=&maxAmount=
Headers: Authorization: Bearer <token>
Response: { items: [...], total: 100 }
```

### Get KYC Status

```ts
GET /admin/kyc?status=pending
Headers: Authorization: Bearer <token>
Response: { items: [...], total: 50 }
```

## Testing API Calls

### Mock Service (Testing)

```ts
// Mock the service for tests
jest.mock('../features/transactions/services', () => ({
  transactionService: {
    getTransactions: jest.fn().mockResolvedValue({
      transactions: [{ id: '1', amount: 100 }],
      total: 1,
    }),
  },
}));
```

### Mock Axios (Testing)

```ts
import axios from 'axios';
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.create.mockReturnValue({
  get: jest.fn(),
  post: jest.fn(),
} as any);
```

### Postman / Curl Testing

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get Transactions (with token)
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer eyJhbGc..."
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-20