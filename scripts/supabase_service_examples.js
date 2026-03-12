/**
 * Example server-side usage of Supabase with service role key.
 * Run this on a secure server (do NOT expose SERVICE_ROLE_KEY in client builds)
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // set in server env

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function markAllUserMessagesRead(userId) {
  const { data, error } = await supabase.from('messages').update({ read: true }).eq('user_id', userId).eq('sender_type', 'user');
  if (error) throw error;
  return data;
}

async function createSystemMessageForUser(userId, text) {
  const { data, error } = await supabase.from('messages').insert([{ sender: 'system', sender_type: 'system', message: text, user_id: userId, read: false }]);
  if (error) throw error;
  return data;
}

module.exports = { markAllUserMessagesRead, createSystemMessageForUser };
