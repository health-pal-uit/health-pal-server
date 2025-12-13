# Insert test user into test database
# Run this if the test user gets accidentally deleted

$env:PGPASSWORD = '135792468'

Write-Host "Inserting test user into test database..." -ForegroundColor Cyan

$sql = @"
-- Insert role
INSERT INTO roles (id, name, created_at) 
VALUES ('8f7924ae-eb80-4663-aced-05323c046f61', 'user', NOW()) 
ON CONFLICT (id) DO NOTHING;

-- Insert user
INSERT INTO users (id, username, email, fullname, gender, birth_date, role_id, "isVerified", created_at) 
VALUES (
  '4d46d27a-c9e3-465d-8e4e-a5171905da39', 
  'hankhongg', 
  'hankhongg@gmail.com', 
  'Khong Han', 
  false, 
  '2005-06-10', 
  '8f7924ae-eb80-4663-aced-05323c046f61', 
  true, 
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT id, email, username, "isVerified" FROM users WHERE email = 'hankhongg@gmail.com';
"@

psql -U postgres -h localhost -p 5432 -d "health-pal-db-test" -c $sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Test user inserted successfully!" -ForegroundColor Green
    Write-Host "`nUser details:" -ForegroundColor Cyan
    Write-Host "  Email: hankhongg@gmail.com" -ForegroundColor White
    Write-Host "  ID: 4d46d27a-c9e3-465d-8e4e-a5171905da39" -ForegroundColor White
}
else {
    Write-Host "`n✗ Failed to insert test user" -ForegroundColor Red
    exit 1
}
