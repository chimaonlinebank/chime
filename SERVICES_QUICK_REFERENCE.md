# Supabase Services Quick Reference

## Authentication Service
**File**: `src/services/supabaseAuthService.ts`

### Sign Up New User
```typescript
import { signUpWithSupabase } from '@/services/supabaseAuthService';

const { user, error } = await signUpWithSupabase(
  'user@example.com',
  'password123',
  { firstName: 'John', lastName: 'Doe' }
);

if (error) console.error('Signup failed:', error);
if (user) console.log('User created:', user.id);
```

### Sign In User
```typescript
import { signInWithSupabase } from '@/services/supabaseAuthService';

const { session, error } = await signInWithSupabase(
  'user@example.com',
  'password123'
);

if (session) console.log('Logged in:', session.user.id);
```

### Get Current User
```typescript
import { getCurrentUserSupabase } from '@/services/supabaseAuthService';

const user = await getCurrentUserSupabase();
console.log('Current user:', user);
```

### Sign Out
```typescript
import { signOutFromSupabase } from '@/services/supabaseAuthService';

await signOutFromSupabase();
```

### Listen to Auth Changes (In Components)
```typescript
import { useEffect } from 'react';
import { onAuthStateChangeSupabase } from '@/services/supabaseAuthService';

useEffect(() => {
  const unsubscribe = onAuthStateChangeSupabase((session) => {
    if (session) {
      console.log('User logged in:', session.user.id);
    } else {
      console.log('User logged out');
    }
  });
  
  return unsubscribe; // Cleanup
}, []);
```

---

## Database Service
**File**: `src/services/supabaseDbService.ts`

### User Profile Operations
```typescript
import { supabaseDbService } from '@/services/supabaseDbService';

// Create user profile
await supabaseDbService.createUserProfile({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'ACTIVE'
});

// Get user profile
const profile = await supabaseDbService.getUserProfile(userId);

// Update user profile
await supabaseDbService.updateUserProfile(userId, {
  firstName: 'Jane',
  address: '123 Main St'
});
```

### Bank Account Operations
```typescript
// Create bank account
await supabaseDbService.createBankAccount({
  userId: userId,
  accountNumber: '1234567890',
  routingNumber: '021000021',
  accountType: 'CHECKING',
  currency: 'USD'
});

// Get user's bank account
const account = await supabaseDbService.getBankAccount(userId);
```

### Virtual Card Operations
```typescript
// Create virtual card
await supabaseDbService.createVirtualCard({
  userId: userId,
  cardNumber: '4242424242424242',
  expiryDate: '12/28',
  cvv: '123',
  cardholderName: 'John Doe',
  dailyLimit: 1000,
  balance: 500
});

// Get user's cards
const cards = await supabaseDbService.getUserVirtualCards(userId);

// Update card (e.g., freeze it)
await supabaseDbService.updateVirtualCard(cardId, {
  frozen: true,
  status: 'FROZEN'
});
```

### Transaction Operations
```typescript
// Create transaction
await supabaseDbService.createTransaction({
  userId: userId,
  type: 'credit',
  amount: 100,
  description: 'Deposit',
  timestamp: new Date().toISOString(),
  status: 'completed'
});

// Get user's transactions (last 50)
const transactions = await supabaseDbService.getUserTransactions(userId);

// Get specific number of transactions
const last100 = await supabaseDbService.getUserTransactions(userId, 100);
```

### Activity Operations
```typescript
// Create activity
await supabaseDbService.createActivity({
  userId: userId,
  type: 'TRANSFER_SENT',
  amount: 50,
  description: 'Sent $50 to John',
  timestamp: new Date().toISOString()
});

// Get user's activity
const activities = await supabaseDbService.getUserActivity(userId);

// Get specific number of activities
const last100 = await supabaseDbService.getUserActivity(userId, 100);
```

### Bulk Data Migration
```typescript
// Migrate all user data from localStorage to Supabase
const success = await supabaseDbService.migrateUserData(
  userId,
  profileData,      // UserProfile
  accountData,       // BankAccount
  cardsData,        // VirtualCard[]
  transactionsData, // Transaction[]
  activityData      // Activity[]
);

if (success) console.log('Migration completed');
```

---

## Realtime Chat Service
**File**: `src/services/supabaseChatRealtime.ts`

### Subscribe to Chat Room
```typescript
import { chatRealtimeService } from '@/services/supabaseChatRealtime';

chatRealtimeService.subscribeToChatRoom(
  'support-room-123',
  (message) => {
    console.log('New message:', message);
    // Update UI with message
  }
);
```

### Send Message
```typescript
await chatRealtimeService.sendChatMessage({
  room_id: 'support-room-123',
  sender_id: currentUserId,
  sender_type: 'user', // or 'admin'
  message: 'Hello support team!',
  timestamp: new Date().toISOString()
});
```

### Mark Messages as Read
```typescript
await chatRealtimeService.markMessagesAsRead(
  'support-room-123',
  currentUserId
);
```

### Unsubscribe from Room
```typescript
chatRealtimeService.unsubscribeFromChatRoom('support-room-123');
```

### Unsubscribe from All Rooms (Cleanup)
```typescript
useEffect(() => {
  return () => {
    chatRealtimeService.unsubscribeFromAll();
  };
}, []);
```

---

## Error Handling Patterns

### Try-Catch Pattern
```typescript
try {
  const user = await supabaseDbService.getUserProfile(userId);
  if (!user) {
    console.error('User not found');
    return;
  }
  // Use user...
} catch (error) {
  console.error('Database error:', error);
}
```

### Null Check Pattern
```typescript
const profile = await supabaseDbService.getUserProfile(userId);
// This already returns null on error, no need for error checking
if (profile) {
  console.log('Profile exists:', profile.email);
} else {
  console.log('Profile not found or error');
}
```

### Auth Error Handling
```typescript
const { user, error } = await signUpWithSupabase(email, password);
if (error) {
  console.error('Auth error:', error.message);
  // Show error to user
}
```

---

## Common Usage Patterns

### Update Multiple Things After Account Creation
```typescript
const userId = 'user-123';

// 1. Create user profile
await supabaseDbService.createUserProfile({
  id: userId,
  email: 'user@example.com',
  status: 'ACTIVE'
});

// 2. Create bank account
await supabaseDbService.createBankAccount({
  userId,
  accountNumber: 'ACC123',
  routingNumber: 'RT123',
  accountType: 'CHECKING',
  currency: 'USD'
});

// 3. Create virtual card
await supabaseDbService.createVirtualCard({
  userId,
  cardNumber: 'CARD123',
  expiryDate: '12/28',
  cvv: '123',
  cardholderName: 'User Name',
  dailyLimit: 1000,
  balance: 0
});

// 4. Create welcome transaction
await supabaseDbService.createTransaction({
  userId,
  type: 'credit',
  amount: 10,
  description: 'Welcome Bonus',
  timestamp: new Date().toISOString(),
  status: 'completed'
});

// 5. Record activity
await supabaseDbService.createActivity({
  userId,
  type: 'ACCOUNT_CREATED',
  description: 'Account successfully created',
  timestamp: new Date().toISOString()
});
```

### Load User Dashboard Data
```typescript
const userId = 'user-123';

// Load all dashboard data in parallel
const [profile, account, cards, transactions, activities] = await Promise.all([
  supabaseDbService.getUserProfile(userId),
  supabaseDbService.getBankAccount(userId),
  supabaseDbService.getUserVirtualCards(userId),
  supabaseDbService.getUserTransactions(userId, 20),
  supabaseDbService.getUserActivity(userId, 20)
]);

// Use data for rendering...
```

### Real-time Chat Room
```typescript
const roomId = `user-${userId}-support`;

useEffect(() => {
  // Subscribe to messages
  chatRealtimeService.subscribeToChatRoom(roomId, (message) => {
    setMessages(prev => [...prev, message]);
  });

  // Mark as read when component loads
  chatRealtimeService.markMessagesAsRead(roomId, userId);

  // Cleanup
  return () => chatRealtimeService.unsubscribeFromChatRoom(roomId);
}, [roomId, userId]);
```

---

## Type Definitions

```typescript
// User Profile
interface UserProfile {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  nationality?: string;
  occupation?: string;
  salaryRange?: string;
  dateOfBirth?: string;
  gender?: string;
  accountCurrency?: string;
  accountType?: string;
  status: 'UNREGISTERED' | 'ACTIVE' | 'SUSPENDED';
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Bank Account
interface BankAccount {
  id?: string;
  userId: string;
  accountNumber: string;
  routingNumber: string;
  accountType: string;
  currency: string;
  createdAt?: string;
}

// Virtual Card
interface VirtualCard {
  id?: string;
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  dailyLimit: number;
  balance: number;
  frozen: boolean;
  status: 'ACTIVE' | 'FROZEN' | 'CANCELLED';
  createdAt?: string;
}

// Transaction
interface Transaction {
  id?: string;
  userId: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  description: string;
  recipient?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

// Activity
interface Activity {
  id?: string;
  userId: string;
  type: string;
  amount?: number;
  description: string;
  timestamp: string;
}

// Chat Message
interface ChatMessage {
  id?: string;
  room_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  timestamp: string;
  read?: boolean;
}
```

---

## Performance Tips

1. **Use Promise.all() for parallel queries**
   ```typescript
   const [profile, cards, transactions] = await Promise.all([...]); // Faster
   ```

2. **Limit transaction/activity results**
   ```typescript
   // Only load what you need, paginate for more
   const recent20 = await supabaseDbService.getUserTransactions(userId, 20);
   ```

3. **Unsubscribe from chat rooms when not needed**
   ```typescript
   // Clean up subscriptions to prevent memory leaks
   chatRealtimeService.unsubscribeFromChatRoom(roomId);
   ```

4. **Cache user profile data**
   ```typescript
   // Load once, use from Redux/Context for repeated access
   const { user } = useAuthContext(); // Already cached
   ```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase client not initialized" | Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local |
| Data not saving | Verify Row Level Security (RLS) policies allow the operation |
| Chat not updating | Ensure chat_messages table realtime is enabled |
| Slow queries | Add indexes or limit result set |
| Auth not persisting | Verify AuthProvider wraps entire app |

---

**Last Updated**: Current Session  
**Service Version**: 1.0  
**Supabase Project**: https://rwfgwwzodjbudoothohs.supabase.co
