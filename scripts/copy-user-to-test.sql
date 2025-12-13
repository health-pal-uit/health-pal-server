-- Copy user from dev to test database
\c "health-pal-db-test"

-- First, copy role
INSERT INTO roles (id, name, created_at, updated_at)
SELECT id, name, created_at, updated_at 
FROM "health-pal-db".roles 
WHERE name = 'user'
ON CONFLICT (id) DO NOTHING;

-- Copy your user (check actual columns first)
INSERT INTO users 
SELECT * FROM "health-pal-db".users 
WHERE email = 'hankhongg@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'User copied!' as status, id, email, username 
FROM users WHERE email = 'hankhongg@gmail.com';
