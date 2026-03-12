-- messages_rls_policies.sql
-- Enable RLS and add policies for messages table

-- Enable Row Level Security
alter table messages enable row level security;

-- Allow authenticated users to insert messages where user_id = auth.uid()
create policy "allow_insert_own_messages" on messages for insert using (true) with check (user_id::text = auth.uid() or auth.role() = 'service_role');

-- Allow users to read their own messages
create policy "allow_select_own_messages" on messages for select using (user_id::text = auth.uid() or auth.role() = 'service_role');

-- Allow admins (via custom claim role) or service role to select all messages
create policy "allow_admin_select_all" on messages for select using (auth.role() = 'authenticated' and (current_setting('jwt.claims.role', true) = 'admin'));

-- Allow service_role to update read status
create policy "allow_service_update_read" on messages for update using (auth.role() = 'service_role') with check (true);

-- NOTE: Adjust policies to your project's auth claims and environment. The examples above show patterns but must be tested.
