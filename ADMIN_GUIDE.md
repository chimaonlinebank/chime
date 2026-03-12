# Admin System & Role-Based Control

## Overview

The admin system provides a comprehensive control center for financial operations management, user oversight, fraud detection, and compliance.

## Admin Access

### Role Permissions

```ts
// src/types/index.ts
export type Role = 'user' | 'admin';

// Only users with role === 'admin' can access /admin/* routes
```

### Route Guards

```tsx
// src/routes/ProtectedRoute.tsx
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};
```

Every admin route is wrapped:

```tsx
<Route
  path="/admin/users"
  element={
    <AdminRoute>
      <AdminUsers />
    </AdminRoute>
  }
/>
```

## Admin Modules

### 1. Dashboard (`/admin`)

**Features:**
- Key metrics (active users, transactions, fraud alerts)
- Quick action cards
- Recent activity feed
- System health indicators

**Component:** `src/app/components/admin/AdminDashboard.tsx`

**Data source:** `adminService.getAnalytics(period)`

### 2. User Management (`/admin/users`)

**Features:**
- Search & filter users
- View user profiles
- Suspend/reactivate accounts
- View user history

**Component:** `src/app/components/admin/AdminUsers.tsx`

**Services:**
```ts
adminService.getUsers({ role, status, search });
adminService.getUserDetails(userId);
adminService.suspendUser(userId);
```

**Example UI:**
```
Search Bar [━━━━━━━━]
Filter: [ Status ▼ ] [ KYC ▼ ]

┌─────────────────────────┐
│ User ID │ Email │ Status│
├─────────────────────────┤
│ 123 │ user@... │ Active │
│ 124 │ user2@.. │ Suspended │
└─────────────────────────┘

Page 1 of 10  [← Prev] [Next →]
```

### 3. Transaction Monitoring (`/admin/transactions`)

**Features:**
- Monitor all transactions
- Filter by type, amount range, date
- Block/flag suspicious transactions
- View transaction details

**Component:** `src/app/components/admin/AdminTransactions.tsx`

**Services:**
```ts
adminService.getTransactions({ 
  fromDate, 
  toDate, 
  minAmount, 
  maxAmount,   
  status 
});
adminService.blockTransaction(txId, reason);
```

**Risk indicators:**
- 🔴 High-value transfers (>$10k)
- 🟡 Rapid succession (>5 in 1 hour)
- 🔴 Unusual recipient location
- 🟡 First-time recipient

### 4. KYC Verification (`/admin/kyc`)

**Features:**
- Queue of pending KYC submissions
- View uploaded documents
- Approve/reject with reason
- Track verification status

**Component:** `src/app/components/admin/AdminKYC.tsx`

**Services:**
```ts
adminService.getKYCStatus({ status: 'pending' | 'approved' | 'rejected' });
adminService.approveKYC(kycId);
adminService.rejectKYC(kycId, reason);
```

**Status flow:**
```
Submitted → Pending → Approved → Active
            ↓
          Rejected → Resubmission
```

### 5. Fraud Detection (`/admin/fraud`)

**Features:**
- Fraud case management
- Automated risk scoring
- Case assignment to investigators
- Resolution tracking

**Component:** `src/app/components/admin/AdminFraud.tsx`

**Services:**
```ts
adminService.getFraudCases({ 
  severity: 'high' | 'medium' | 'low',
  status: 'open' | 'investigating' | 'resolved'
});
```

**Risk scoring (backend example):**
```
Score = 
  (velocityScore * 0.3) +
  (amountAnomaly * 0.25) +
  (geoDistance * 0.2) +
  (deviceFingerprint * 0.15) +
  (historicalFlags * 0.1)

If Score > 75: HIGH RISK 🔴
If Score > 50: MEDIUM RISK 🟡
If Score > 25: LOW RISK 🟢
```

### 6. Support Tickets (`/admin/support`)

**Features:**
- Customer support ticket queue
- Priority assignment
- Ticket resolution tracking
- Customer communication history

**Component:** `src/app/components/admin/AdminSupport.tsx`

### 7. Analytics & Reports (`/admin/reports`)

**Features:**
- Daily/weekly/monthly metrics
- User growth trends
- Revenue reports
- Compliance reporting
- Export to CSV/PDF

**Component:** `src/app/components/admin/AdminReports.tsx`

**Services:**
```ts
adminService.getAnalytics('daily' | 'weekly' | 'monthly');
adminService.getReports();
```

**Example metrics:**
```
Daily Active Users: 5,234
New Sign-ups: 342
Total Transactions: 12,456
Transaction Volume: $2.4M
Fraud Incidents: 8 (0.06%)
KYC Completion: 94%
```

## Admin Service API

Complete admin service in `src/features/admin/services/adminService.ts`:

```ts
export const adminService = {
  // Users
  getUsers(filters?),
  getUserDetails(id),
  suspendUser(id),
  
  // Transactions
  getTransactions(filters?),
  blockTransaction(id, reason),
  
  // Fraud
  getFraudCases(filters?),
  
  // KYC
  getKYCStatus(filters?),
  approveKYC(id),
  rejectKYC(id, reason),
  
  // Reports
  getReports(),
  getAnalytics(period),
};
```

## Admin Layout Pattern

Typical admin pages follow this structure:

```tsx
import { LayoutContainer, SectionWrapper, DataTable, TableFilter } from '../../components/base';

export default function AdminPages() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading } = useAsync(() => 
    adminService.getData({ search, page })
  );

  return (
    <LayoutContainer>
      <SectionWrapper title="Page Title">
        
        {/* Filters */}
        <TableFilter onSearch={setSearch} />
        
        {/* Data Table */}
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={data?.items || []}
          isLoading={loading}
        />
        
        {/* Pagination */}
        <TablePagination
          currentPage={page}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
        
      </SectionWrapper>
    </LayoutContainer>
  );
}
```

## Audit Logging

All admin actions should be logged:

```ts
// In backend middleware
app.post('/admin/users/:id/suspend', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  
  // Log action
  await auditLog.create({
    action: 'USER_SUSPENDED',
    adminId,
    targetUserId: id,
    timestamp: new Date(),
    ip: req.ip,
  });
  
  // Perform action
  await User.findByIdAndUpdate(id, { suspended: true });
  
  res.json({ success: true });
});
```

## Compliance Considerations

### KYC/AML Requirements

- Document verification (ID, address, SSN)
- Sanctions list screening
- PEP (Politically Exposed Person) checks
- Transaction monitoring thresholds
- Report suspicious activity (SAR) to FinCEN

### Admin Checklist

- [ ] All admin actions audit-logged
- [ ] Admin credentials rotated regularly
- [ ] 2FA enabled for admin accounts
- [ ] IP whitelisting for admin portal
- [ ] Data residency compliance met
- [ ] GDPR/CCPA data deletion handled
- [ ] Regulatory reports generated automatically

## Admin Onboarding

### First-time Setup

1. Create admin account via backend (not self-signup)
2. Set strong password + 2FA
3. Assign role and permissions
4. Provide admin portal URL
5. Document procedures per feature

### Daily Checks

- Monitor fraud cases
- Review KYC queue
- Check system health
- Respond to support tickets

### Weekly Tasks

- Generate compliance reports
- Review user suspension appeals
- Analyze transaction patterns

### Monthly Tasks

- Regulatory filings
- Audit log review
- Performance metrics analysis

## Example: Adding a New Admin Feature

1. **Backend endpoint:**
```ts
router.post('/admin/custom-action', adminMiddleware, handler);
```

2. **Service method:**
```ts
// src/features/admin/services/adminService.ts
customAction: async (params) => {
  const res = await apiClient.post('/admin/custom-action', params);
  return res.data;
},
```

3. **Component:**
```tsx
// src/app/components/admin/AdminCustom.tsx
export default function AdminCustom() {
  const [result, setResult] = useState(null);
  const handleAction = async () => {
    const res = await adminService.customAction({ /* params */ });
    setResult(res);
  };
  return <button onClick={handleAction}>Execute</button>;
}
```

4. **Route:**
```tsx
// src/app/App.tsx
<Route path="/admin/custom" element={<AdminRoute><AdminCustom /></AdminRoute>} />
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-20