# Supabase Integration Setup Guide

This guide walks through the setup and migration process for integrating Supabase with the Chime app.

## 1. Supabase Project Already Configured

Your Supabase credentials are already in `.env.local`:
- **URL**: `https://rwfgwwzodjbudoothohs.supabase.co`
- **Anon Key**: `sb_publishable_BZ2krGN-tgrz78_y2HiHYg_tPMeCJAY`

## 2. Create Database Tables

Log into your Supabase dashboard and run these SQL commands in the SQL Editor:

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  address VARCHAR(255),
  nationality VARCHAR(100),
  occupation VARCHAR(100),
  salaryRange VARCHAR(50),
  dateOfBirth DATE,
  gender VARCHAR(20),
  accountCurrency VARCHAR(3) DEFAULT 'USD',
  accountType VARCHAR(20) DEFAULT 'CHECKING',
  status VARCHAR(20) DEFAULT 'UNREGISTERED',
  photoUrl TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "System can insert user data" ON users
  FOR INSERT WITH CHECK (true);
```

### Bank Accounts Table
```sql
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accountNumber VARCHAR(20) UNIQUE NOT NULL,
  routingNumber VARCHAR(10) NOT NULL,
  accountType VARCHAR(20) DEFAULT 'CHECKING',
  currency VARCHAR(3) DEFAULT 'USD',
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, accountNumber)
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "Users can create accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = userId);
```

### Virtual Cards Table
```sql
CREATE TABLE IF NOT EXISTS virtual_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cardNumber VARCHAR(20) UNIQUE NOT NULL,
  expiryDate VARCHAR(7) NOT NULL,
  cvv VARCHAR(4) NOT NULL,
  cardholderName VARCHAR(100) NOT NULL,
  dailyLimit DECIMAL(10, 2) DEFAULT 1000,
  balance DECIMAL(10, 2) DEFAULT 0,
  frozen BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT NOW()
);

ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON virtual_cards
  FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "Users can create cards" ON virtual_cards
  FOR INSERT WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update own cards" ON virtual_cards
  FOR UPDATE USING (auth.uid() = userId);
```

### Transactions Table
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'transfer'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  recipient VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed',
  INDEX idx_userId_timestamp (userId, timestamp DESC)
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "System can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);
```

### Activity Table
```sql
CREATE TABLE IF NOT EXISTS activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2),
  description TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX idx_userId_timestamp (userId, timestamp DESC)
);

ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON activity
  FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "System can create activity" ON activity
  FOR INSERT WITH CHECK (true);
```

### Chat Messages Table (Realtime)
```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(100) NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) NOT NULL, -- 'user', 'admin'
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

CREATE POLICY "Anyone can view chat" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);
```

## 3. Environment Variables

Your `.env.local` already has the required keys:

```env
VITE_SUPABASE_URL=https://rwfgwwzodjbudoothohs.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_BZ2krGN-tgrz78_y2HiHYg_tPMeCJAY
```

## 4. Available Services

### `supabaseAuthService.ts` - Authentication
- `signUpWithSupabase(email, password, metadata)` - Register new users
- `signInWithSupabase(email, password)` - User login
- `signOutFromSupabase()` - User logout
- `getCurrentSessionSupabase()` - Get active session object
- `getCurrentUserSupabase()` - Get current user data
- `onAuthStateChangeSupabase(callback)` - Subscribe to auth changes
- `updateUserProfileSupabase(updates)` - Update user metadata

### `supabaseDbService.ts` - Database Operations
**User Profile:**
- `getUserProfile(userId)`
- `createUserProfile(profile)`
- `updateUserProfile(userId, updates)`

**Bank Accounts:**
- `getBankAccount(userId)`
- `createBankAccount(account)`

**Virtual Cards:**
- `getUserVirtualCards(userId)`
- `createVirtualCard(card)`
- `updateVirtualCard(cardId, updates)`

**Transactions:**
- `getUserTransactions(userId, limit = 50)`
- `createTransaction(transaction)`

**Activity:**
- `getUserActivity(userId, limit = 50)`
- `createActivity(activity)`

### `supabaseChatRealtime.ts` - Realtime Chat
- `subscribeToChatRoom(roomId, onMessage)` - Subscribe to chat with realtime updates
- `sendChatMessage(message)` - Send a message
- `markMessagesAsRead(roomId, userId)` - Mark messages as read
- `unsubscribeFromChatRoom(roomId)` - Unsubscribe from room
- `unsubscribeFromAll()` - Unsubscribe from all rooms

## 5. Integration Points

### AuthProvider
The `AuthProvider.tsx` has been updated to use Supabase authentication:
- Automatically detects auth state changes via `onAuthStateChangeSupabase`
- Fetches full user profile from database on login
- Maintains backward compatibility with existing `login()` method
- Adds `isLoading` state for auth initialization

### Migration from localStorage

To migrate existing user data:

```typescript
import { supabaseDbService } from './services/supabaseDbService';

// Get data from localStorage
const storedUser = JSON.parse(localStorage.getItem('auth.user') || '{}');

// Migrate to Supabase
await supabaseDbService.migrateUserData(
  userId,
  {
    email: storedUser.email,
    firstName: storedUser.firstName,
    // ... other profile fields
    status: 'ACTIVE'
  },
  accountData,
  cardsData,
  transactionsData,
  activityData
);
```

## 6. Testing the Integration

### Test Authentication
```typescript
import { signUpWithSupabase, signInWithSupabase } from './services/supabaseAuthService';

// Sign up
const { user, error } = await signUpWithSupabase(
  'test@example.com',
  'password123',
  { firstName: 'John' }
);

// Sign in
const { session, error } = await signInWithSupabase(
  'test@example.com',
  'password123'
);
```

### Test Database
```typescript
import { supabaseDbService } from './services/supabaseDbService';

// Create user profile
const profile = await supabaseDbService.createUserProfile({
  email: 'user@example.com',
  firstName: 'Jane',
  status: 'ACTIVE'
});

// Get user profile
const user = await supabaseDbService.getUserProfile(userId);

// Create transaction
await supabaseDbService.createTransaction({
  userId,
  type: 'credit',
  amount: 100,
  description: 'Deposit',
  timestamp: new Date().toISOString(),
  status: 'completed'
});
```

### Test Realtime Chat
```typescript
import { chatRealtimeService } from './services/supabaseChatRealtime';

// Subscribe to chat room
chatRealtimeService.subscribeToChatRoom(
  'support-room-123',
  (message) => {
    console.log('New message:', message);
  }
);

// Send message
await chatRealtimeService.sendChatMessage({
  room_id: 'support-room-123',
  sender_id: userId,
  sender_type: 'user',
  message: 'Hello support team!',
  timestamp: new Date().toISOString()
});

// Cleanup
chatRealtimeService.unsubscribeFromChatRoom('support-room-123');
```

## 7. Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS enabled. Users can only access their own data.
2. **Anon Key**: The anon key is safe to expose in the browser (public) - it's limited by RLS policies.
3. **Auth Token**: Stored in Supabase's session management (more secure than localStorage).
4. **Profile Updates**: Only admins should be able to update certain fields (implement in RLS policies as needed).

## 8. Troubleshooting

### "Supabase client not initialized"
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in `.env.local`
- Restart dev server after changing `.env` files

### "User not authenticated"
- Ensure `AuthProvider` wraps your app in `main.tsx`
- Check browser console for specific Supabase errors

### "chat_messages subscription failed"
- Make sure `ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;` was executed
- Realtime needs to be enabled per table in Supabase

### Data not persisting
- Check that Row Level Security (RLS) policies exist and allow the operation
- Verify user is authenticated and `auth.uid()` matches the data

## 9. Next Steps

1. ✅ Setup Supabase project and tables (use SQL commands above)
2. ✅ Install @supabase/supabase-js package (already done)
3. ✅ Configure environment variables (already done)
4. ✅ Update AuthProvider to use Supabase (already done)
5. ⏳ Migrate user data from localStorage to Supabase tables
6. ⏳ Update Login/Register flows to use `signUpWithSupabase` and `signInWithSupabase`
7. ⏳ Update all pages to use `supabaseDbService` instead of localStorage
8. ⏳ Test realtime chat with `chatRealtimeService`
9. ⏳ Remove bankingDb mock data (after full migration)
10. ⏳ Enable email verification for production
