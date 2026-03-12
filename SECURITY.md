# Security Best Practices & Hardening

## Frontend Security Controls

### 1. Input Sanitization

**Problem:** XSS attacks via user input

**Solution:** Sanitize before submission

```tsx
import { sanitizeInput } from '../lib/security';

const handleInput = (value: string) => {
  const clean = sanitizeInput(value); // Removes <>, etc.
  setEmail(clean);
};
```

**Good practice:**
```tsx
<input 
  value={sanitizeInput(userInput)} 
  onChange={(e) => setInput(e.target.value)}
/>
```

### 2. Token Management

**Development/Prototype:**
```ts
// localStorage (fallback, less secure)
localStorage.setItem('auth.token', token);
```

**Production (RECOMMENDED):**
```
Backend sets:
Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict

Frontend:
// No manual token handling needed
// Browser auto-sends in all requests
```

**Why HTTP-only cookies?**
- Not accessible to JavaScript (XSS-safe)
- Automatically sent with requests
- Secure flag = HTTPS only
- SameSite = CSRF protection

---

## Extended Security Checklist

### Authentication & Authorization
- [ ] JWT tokens signed with strong secret
- [ ] HTTP-only secure cookies in production
- [ ] Token refresh mechanism (1h expiry)
- [ ] Admin routes guarded (role check)
- [ ] Logout clears all tokens and session
- [ ] MFA/2FA support (optional, recommended)

### Input Validation & Sanitization
- [ ] All forms use Zod schemas
- [ ] Inputs checked before API call
- [ ] Sanitize special characters
- [ ] No eval() or new Function()
- [ ] DOMPurify for HTML content

### API Security
- [ ] HTTPS/TLS only
- [ ] Rate limiting (5 attempts in 15 min)
- [ ] CORS properly configured
- [ ] CSRF tokens or SameSite cookies
- [ ] Parameterized queries (SQL injection)
- [ ] No error details in responses

### Content Security
- [ ] CSP headers set
- [ ] No inline scripts
- [ ] Subresource integrity for CDN
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin

### Secrets & Keys
- [ ] API keys in environment variables
- [ ] No secrets in version control
- [ ] .env.local in .gitignore
- [ ] Rotate secrets monthly
- [ ] Different keys per environment

### Logging & Monitoring
- [ ] No PII logged (email, SSN, passwords)
- [ ] Audit trail for admin actions
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Suspicious activity alerts

### Dependencies
- [ ] npm audit pass
- [ ] Dependabot enabled
- [ ] Security patches applied monthly
- [ ] Deprecated packages removed
- [ ] Version pinning in package-lock.json

### Infrastructure
- [ ] HTTPS enforced (redirect HTTP)
- [ ] HSTS header enabled
- [ ] DDoS protection (Cloudflare)
- [ ] WAF configured
- [ ] Backups encrypted
- [ ] Database encryption at rest

---

## Code Examples

### Secure Login Handler
```ts
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate input
  const validation = LoginSchema.safeParse({ email, password });
  if (!validation.success) {
    setErrors(validation.error.flatten().fieldErrors);
    return;
  }
  
  setLoading(true);
  try {
    // Call API (token auto-injected)
    const { token, user } = await authService.login(email, password);
    
    // Save securely
    login(token, user);  // Redux + localStorage
    
    // Redirect
    navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  } catch (error) {
    // Generic error message (don't expose server details)
    addToast('error', 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Protected API Service
```ts
export const protectedService = {
  // Auto-injects token via interceptor
  getData: async () => {
    try {
      const res = await apiClient.get('/protected-endpoint');
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token invalid: logout
        logout();
      }
      throw error;
    }
  },
};
```

### Admin Route Guard
```tsx
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthContext();
  
  // Check both auth and role
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  
  return <>{children}</>;
};
```

### Error Boundary with Logging
```tsx
export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: any) {
    // Log to Sentry (never log user data)
    Sentry.captureException(error, {
      contexts: { react: info },
      tags: { boundary: 'app' },
    });
    
    console.error('Unhandled error:', error.message);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>Our team has been notified. Please refresh the page.</p>
          {/* Support contact info */}
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## Production Deployment Checklist

**Before going live:**
- [ ] All environment variables configured
- [ ] HTTPS certificate installed
- [ ] Secrets rotated (generate new keys)
- [ ] Database backups enabled
- [ ] Monitoring/alerting configured
- [ ] Admin account with strong password
- [ ] Audit logging tested
- [ ] Rate limiting verified
- [ ] CORS whitelist reviewed
- [ ] Security headers in HTTP responses
- [ ] Sensitive routes protected
- [ ] Error pages don't leak info
- [ ] Logs don't contain secrets
- [ ] Incident response plan ready

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-20

### 3. CSRF Protection

**Pattern:** Synchronizer token

**Backend implementation:**
```ts
// 1. Server generates CSRF token
router.get('/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrfToken = token;
  res.json({ token });
});

// 2. Frontend includes in POST/PUT/DELETE
const response = await apiClient.post('/endpoint', data, {
  headers: { 'X-CSRF-Token': csrfToken }
});

// 3. Server validates
router.post('/endpoint', validateCSRF, handler);

// With cookies + SameSite=Strict, CSRF is automatically mitigated
```

### 4. Rate Limiting (Frontend Placeholder)

**Implementation:**
```ts
import { checkRateLimit } from '../lib/security';

const handleLogin = async (e) => {
  if (!checkRateLimit('login', 5, 60000)) {
    addToast('error', 'Too many login attempts. Try again in 1 minute.');
    return;
  }
  // Proceed with login
};
```

**Production:** Implement server-side rate limiting via Redis

```ts
// Backend example (node-rate-limiter-flexible)
const limiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'login',
  points: 5,
  duration: 60, // 60 seconds
});

router.post('/auth/login', async (req, res) => {
  try {
    await limiter.consume(req.ip);
    // Proceed
  } catch (e) {
    res.status(429).json({ error: 'Too many requests' });
  }
});
```

### 5. Secure Data Handling

**Never log sensitive data:**
```tsx
// ❌ Bad
console.log('Token:', token);
console.log('SSN:', '123-45-6789');

// ✅ Good
console.log('Token:', token.slice(-4)); // Last 4 chars only
logger.info('Login attempt', { userId, timestamp }); // Safe data
```

**Mask outputs:**
```tsx
// Display
<p>SSN: •••-••-{ssn.slice(-4)}</p>

// Card number
<p>Card: •••• •••• •••• {cardNumber.slice(-4)}</p>
```

### 6. Secure API Communication

**Enforced by apiClient:**
```ts
const apiClient = axios.create({
  baseURL: ENV.VITE_API_URL, // HTTPS in production
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Auto-inject auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth.token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});
```

**Backend CORS config:**
```ts
app.use(cors({
  origin: 'https://app.chime.example.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### 7. Content Security Policy (CSP)

**Frontend comment block:**
```tsx
/**
 * CSP Headers (backend responsibility):
 * 
 * Content-Security-Policy: 
 *   default-src 'self';
 *   script-src 'self';
 *   style-src 'self' 'unsafe-inline';
 *   img-src 'self' data: https:;
 *   font-src 'self';
 *   connect-src 'self' https://api.example.com;
 *   frame-ancestors 'none';
 *   base-uri 'self';
 *   form-action 'self';
 * 
 * This prevents:
 * - Inline script injection
 * - Third-party script loading
 * - Clickjacking (frame-ancestors)
 * - Data exfiltration
 */
```

**Applied in HTML:**
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self'">
```

## Backend Security (Complementary)

### API Layer

```ts
// 1. Authentication
router.use(authenticateToken);  // JWT validation

// 2. Authorization
router.use(authorizeRole('admin')); // Role check

// 3. Rate Limiting
router.use(rateLimiter);

// 4. Input Validation
router.post('/endpoint', validateInput, handler);

// 5. Sanitization
router.use(sanitizeInput);

// 6. Audit Logging
router.use(auditLogger);

// 7. Error Handling (no stack traces in prod)
router.use(errorHandler);
```

### Database Security

```ts
// 1. Use parameterized queries (no string concatenation)
// ✅ Good
const user = await User.findOne({ email: userEmail });

// ❌ Bad
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// 2. Hash passwords (bcrypt, not MD5)
const hashedPassword = await bcrypt.hash(password, 10);

// 3. Encrypt sensitive fields
const cipher = crypto.createCipher('aes-256-cbc', key);
const encrypted = cipher.update(ssn, 'utf8', 'hex');

// 4. Implement row-level security
WHERE user_id = ${currentUser.id}
```

## Compliance & Auditing

### Logging Requirements

```ts
// All sensitive operations logged

export const auditLog = {
  login(userId, ip, success),
  logout(userId),
  suspendUser(adminId, targetUserId, reason),
  approveKYC(adminId, kycId),
  blockTransaction(adminId, txId, reason),
  dataExport(userId, type, timestamp),
};

// Encrypt logs at rest
```

### Data Retention

```ts
// Implement data lifecycle

export const dataRetention = {
  transactionHistory: '7 years',    // Regulatory
  userProfiles: 'Until deletion',    // User request
  auditLogs: '2 years',              // Compliance
  supportTickets: '1 year',
};

// Implement GDPR right to be forgotten
router.delete('/user/delete-account', async (req, res) => {
  const userId = req.user.id;
  
  // Mark for deletion
  await User.findByIdAndUpdate(userId, { 
    deletedAt: new Date(),
    status: 'deleted'
  });
  
  // Schedule hard delete after 30 days
  scheduleHardDelete(userId, 30 * 24 * 60 * 60 * 1000);
  
  res.json({ success: true });
});
```

## Pre-Deployment Checklist

- [ ] **Dependencies:** `npm audit` passes (no critical vulns)
- [ ] **Secrets:** No hardcoded API keys, tokens, or credentials
- [ ] **Environment:** `.env.local` in `.gitignore`
- [ ] **HTTPS:** All API calls use https://
- [ ] **Cookies:** HTTPOnly, Secure, SameSite flags set
- [ ] **CSP:** Headers configured and tested
- [ ] **CORS:** Restricted to known origins
- [ ] **Logging:** Sensitive data not logged
- [ ] **Rate Limiting:** Enabled on auth endpoints
- [ ] **Input Validation:** Zod schemas cover all forms
- [ ] **Error Pages:** No stack traces exposed
- [ ] **Admin Routes:** Protected by role check
- [ ] **Audit Logs:** Implemented for sensitive actions
- [ ] **Password Policy:** Min 8 chars, complexity rules
- [ ] **2FA:** Optional or required for admin
- [ ] **Penetration Test:** Passed (if budget allows)

## Security Headers Summary

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Security-Policy` | XSS prevention | `default-src 'self'` |
| `X-Content-Type-Options` | MIME sniffing | `nosniff` |
| `X-Frame-Options` | Clickjacking | `DENY` |
| `X-XSS-Protection` | Legacy XSS | `1; mode=block` |
| `Strict-Transport-Security` | HTTPS only | `max-age=31536000` |
| `Referrer-Policy` | Leak prevention | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Feature access | `microphone=(), camera=()` |

**Apply via backend:**
```ts
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Incident Response Plan

If security breach detected:

1. **Immediate (minutes):**
   - Identify scope (which users/data affected)
   - Disable compromised accounts
   - Isolate affected systems

2. **Short-term (hours):**
   - Force password resets for affected users
   - Review audit logs
   - Notify security team

3. **Medium-term (days):**
   - Root cause analysis
   - Implement fixes
   - Security audit

4. **Long-term:**
   - Communicate with users transparently
   - File regulatory reports if necessary
   - Implement preventive measures

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-20