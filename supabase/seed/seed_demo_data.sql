-- seed_demo_data.sql
insert into users (id, email, full_name, role)
values
  (gen_random_uuid(), 'alice@example.com', 'Alice Example', 'user'),
  (gen_random_uuid(), 'bob@example.com', 'Bob Example', 'user'),
  (gen_random_uuid(), 'admin@example.com', 'Admin', 'admin');

-- accounts and transactions can be added after user ids are known; this is a simple starter seed
