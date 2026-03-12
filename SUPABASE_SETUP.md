**Supabase Setup**

Overview: This document explains how to provision a Supabase project to provide realtime chats, cloud storage for files (uploads), and a simple relational backend for users, accounts, transactions, and messages.

1) Create a Supabase project
- Go to https://app.supabase.com and create a new project.
- Note the Project URL and anon/public API key.
- Copy the Project URL into `VITE_SUPABASE_URL` and the anon key into `VITE_SUPABASE_ANON_KEY` in your environment (see template `.env.supabase.template`).

2) Install client dependency
Run in your project root:

```bash
npm install @supabase/supabase-js
```

3) Create database schema (SQL)
Open the SQL editor in Supabase and run this migration to create a `messages` table used by the chat and simple indexes:

```sql
create table messages (
  id bigserial primary key,
  sender text not null,
  sender_type text not null,
  message text,
  file_url text,
  file_type text,
  read boolean default false,
  timestamp timestamptz default now(),
  user_id text
);

create index on messages (user_id);
create index on messages (timestamp);

-- Additional tables for accounts / transactions can be created similarly
```

4) Realtime and Policies
- Supabase Realtime is enabled by default for table replication in modern projects. Ensure `messages` is visible to Realtime in the Supabase UI (Database → Replication settings).
- For development, you can keep RLS off. For production, configure Row Level Security policies to restrict writes and reads appropriately.

5) Storage (for uploaded files)
- Create a storage bucket (e.g., `chat-files`) and mark it public or configure signed URLs.
- Store the file URL returned by Supabase storage in the `file_url` column of `messages`.

6) Environment
- Add the env values to your Vite environment file (e.g. `.env.local`):

```
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

7) App changes
- This repository includes `src/services/supabaseClient.ts` which provides helpers: `fetchMessages`, `sendMessageToSupabase`, `subscribeToMessages`, and `getUnreadMessageCountForAdmin`.
- `src/app/components/user/Chat.tsx` and `src/app/components/admin/AdminDashboard.tsx` were updated to use Supabase when env vars are present and fallback to `localStorage` otherwise.

8) Developer checklist
- Install `@supabase/supabase-js`.
- Provision tables and buckets in Supabase.
- Set environment variables locally and in deployment (Vercel/Netlify/Cloud) using the `VITE_` prefixed keys.
- Test chat flow: open user chat and admin dashboard and verify messages appear realtime.

If you'd like, I can add SQL migrations for the other tables (users, accounts, transactions) and a small script to seed demo data. Tell me which tables you want and I will add them.
