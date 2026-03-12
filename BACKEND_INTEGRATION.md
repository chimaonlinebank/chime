# API Integration Guide for Production

## Overview
This guide explains how to connect the Chime banking app to production backend APIs.

## Current State
- ✅ Frontend is **mock data free** and ready for backend integration
- ✅ All components use `bankingDb` and localStorage for temporary data
- ✅ API client is configured and ready for endpoint integration
- ❌ Backend API endpoints need to be implemented

## Step 1: Backend API Setup

### Required API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/me
```

#### User Endpoints
```
GET    /api/users/{id}
PUT    /api/users/{id}
GET    /api/users/{id}/accounts
GET    /api/users/{id}/transactions
DELETE /api/users/{id} (GDPR - account deletion)
```

#### Account Endpoints
```
GET    /api/accounts/{id}
GET    /api/accounts/{id}/balance
GET    /api/accounts/{id}/transactions
GET    /api/accounts/{id}/cards
POST   /api/accounts/{id}/transfer
```

#### Admin Endpoints
```
GET    /api/admin/users (paginated)
GET    /api/admin/users/{id}
PUT    /api/admin/users/{id}/status
GET    /api/admin/kyc
POST   /api/admin/kyc/{id}/approve
POST   /api/admin/kyc/{id}/reject
GET    /api/admin/deposits
POST   /api/admin/deposits/{id}/approve
POST   /api/admin/deposits/{id}/reject
GET    /api/admin/transactions
GET    /api/admin/fraud-alerts
```

#### KYC Endpoints
```
POST   /api/kyc/submit
GET    /api/kyc/{id}
PUT    /api/kyc/{id}
```

#### Support/Chat Endpoints
```
GET    /api/support/messages
POST   /api/support/messages
PUT    /api/support/messages/{id}
```

## Step 2: Update API Client

### File: `src/lib/apiClient.ts`

The API client is ready and will automatically:
- ✅ Attach Bearer tokens to all requests
- ✅ Handle authentication errors
- ✅ Set proper content-type headers
- ✅ Log errors (in development only)

### Configuration via Environment Variables

Update `.env.production` with your API:
```
VITE_API_URL=https://api.chime.production.com
```

## Step 3: Update Service Files

### Example: AuthProvider Update

Replace the demo login logic:

```tsx
// Old (Demo)
const token = 'demo-token';

// New (Production)
const response = await apiClient.post('/auth/login', { email, password });
const { token, user } = response.data;
```

### Files to Update
1. `src/context/AuthProvider.tsx` - Authentication logic
2. `src/services/transactionService.ts` - Transaction operations
3. `src/app/components/admin/AdminUsers.tsx` - Admin data fetching
4. `src/app/components/user/Dashboard.tsx` - Dashboard data fetching

## Step 4: Database Migration

### Replace In-Memory Database

Currently: `src/services/bankingDatabase.ts` (in-memory only)

Action Required: Replace with actual database connection
- PostgreSQL (recommended)
- MongoDB
- Firebase/Cloud Firestore
- AWS DynamoDB

### Migration Steps
1. Create database schemas
2. Create migration scripts
3. Setup connection pooling
4. Configure backup strategy
5. Test data recovery procedures

## Step 5: Authentication Flow

### Token Management

**Recommended: HTTP-Only Cookies**
```tsx
// Backend sets httpOnly cookie on login
// Frontend doesn't need to manage token storage
// Automatically sent with each request
```

**Current Implementation: LocalStorage (insecure for production)**
```tsx
// DO NOT use in production
localStorage.setItem('auth.token', token);
localStorage.setItem('auth.user', JSON.stringify(user));
```

### Session Management
- Implement refresh token rotation
- Set appropriate token expiry (15-30 minutes recommended)
- Implement automatic token refresh
- Handle token expiration gracefully

## Step 6: Error Handling

### API Response Format (Recommended)

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
```

### Error Codes to Handle
- `401` - Unauthorized (redirect to login)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `422` - Validation error
- `429` - Rate limited
- `500` - Server error
- `503` - Service unavailable

## Step 7: Data Synchronization

### Real-Time Updates

Implement WebSocket connections for:
- Transaction notifications
- Balance updates
- Account status changes
- Admin notifications

Example:
```tsx
const ws = new WebSocket('wss://api.chime.com/ws');
ws.on('transaction', (data) => {
  // Update local state
  updateBalance(data.newBalance);
});
```

## Step 8: Production Checklist

Before deploying:
- [ ] All API endpoints are tested
- [ ] Error handling is comprehensive
- [ ] Token refresh logic works
- [ ] Database connection is secure
- [ ] HTTPS is enforced
- [ ] CORS is configured for production domain only
- [ ] Rate limiting is implemented
- [ ] Monitoring is set up
- [ ] Logging doesn't expose sensitive data
- [ ] All console.log calls are removed or conditionally disabled

## Step 9: Testing

### Load Testing
```bash
# Test with 1000+ concurrent users
k6 run load-test.js
# Expected response time: < 200ms
# Success rate: > 99.9%
```

### Security Testing
- SQL injection attempts
- XSS attack prevention
- CSRF protection
- Rate limiting effectiveness
- Token security

## Step 10: Rollout Strategy

### Phased Deployment
1. **Phase 1**: Deploy to staging environment
2. **Phase 2**: Run full test suite
3. **Phase 3**: Beta testing with small user group
4. **Phase 4**: Gradual traffic increase (5% → 25% → 100%)
5. **Phase 5**: Monitor metrics and performance

### Rollback Plan
- Keep previous version running
- Quick rollback if issues detected
- Automated alerts for error rate spike

## Troubleshooting

### Common Issues

**Issue: API calls failing with 401**
- Check token is being sent correctly
- Verify token hasn't expired
- Clear localStorage and re-login

**Issue: Slow API responses**
- Check database query performance
- Implement caching strategy
- Add database indexes
- Consider query optimization

**Issue: CORS errors**
- Verify CORS headers are set correctly
- Check allowed origins configuration
- Test preflight requests

## Support & Resources

- API Documentation: `/docs/api`
- Database Schema: `/docs/database`
- Architecture Diagram: `/docs/architecture.md`
- Security Guide: `/SECURITY.md`

---

**Status**: Ready for backend integration
**Last Updated**: February 23, 2026
**Maintained By**: Chime Engineering Team
