**Supabase Auth Setup**

1) Enable Auth in your Supabase project
- In the Supabase dashboard, go to Authentication → Settings and enable email/password providers.

2) Configure roles
- You can use JWT claims (e.g., `role`) to differentiate `admin` vs `user` in policies. When creating an admin user, set the `role` claim in a custom function or manage via database `users` table.

3) Client-side auth helper (examples)
- Sign up:

```js
import supabaseClient from './src/services/supabaseClient';
const client = supabaseClient.getClient();
await client.auth.signUp({ email, password });
```

- Sign in:

```js
await client.auth.signInWithPassword({ email, password });
```

- Sign out:

```js
await client.auth.signOut();
```

4) Admin vs User
- For server actions (e.g., marking messages read globally), use a server-side service role key and the server example in `scripts/supabase_service_examples.js`.

5) Notes
- Ensure you do not expose service role keys to the browser.
- Test RLS policies with different user roles and the Supabase SQL editor.
