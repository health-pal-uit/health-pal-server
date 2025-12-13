# Script to insert an admin user into the database
# This creates the admin user in the database and assigns admin role

param(
    [Parameter(Mandatory = $false)]
    [string]$UserId,
    
    [Parameter(Mandatory = $true)]
    [string]$Email,
    
    [Parameter(Mandatory = $false)]
    [string]$RoleName = "admin"
)

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "health-pal-db-test"  # Using test database
$DB_USER = "postgres"
$DB_PASSWORD = "135792468"  # From .env file

Write-Host "Setting up admin user in database..." -ForegroundColor Cyan
Write-Host "Database: $DB_NAME" -ForegroundColor Gray
Write-Host "Email: $Email" -ForegroundColor Gray
Write-Host "Role: $RoleName" -ForegroundColor Gray

# If UserId not provided, generate one
if (-not $UserId) {
    Write-Host "`nℹ️  No UserId provided. Please create the user in Supabase first using get-admin-token.ps1" -ForegroundColor Yellow
    Write-Host "Then run this script with the User ID:" -ForegroundColor Yellow
    Write-Host ".\insert-admin-user.ps1 -UserId 'USER_ID_FROM_SUPABASE' -Email 'admin@example.com'" -ForegroundColor Gray
    exit
}

# SQL commands
$sql = @"
-- Ensure admin role exists
INSERT INTO roles (id, name, created_at) 
VALUES (gen_random_uuid(), '$RoleName', NOW())
ON CONFLICT (name) DO NOTHING;

-- Get the admin role id
DO `$`$
DECLARE
    v_role_id UUID;
    v_user_exists BOOLEAN;
BEGIN
    -- Get admin role id
    SELECT id INTO v_role_id FROM roles WHERE name = '$RoleName';
    
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE id = '$UserId') INTO v_user_exists;
    
    IF v_user_exists THEN
        -- Update existing user to admin
        UPDATE users 
        SET role_id = v_role_id
        WHERE id = '$UserId';
        RAISE NOTICE 'Updated existing user to admin role';
    ELSE
        -- Insert new user with admin role (username derived from email)
        INSERT INTO users (id, username, email, role_id, created_at)
        VALUES ('$UserId', split_part('$Email', '@', 1), '$Email', v_role_id, NOW())
        ON CONFLICT (id) DO UPDATE SET role_id = v_role_id;
        RAISE NOTICE 'Inserted new admin user';
    END IF;
END `$`$;

-- Verify the user
SELECT u.id, u.email, r.name as role_name
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.id = '$UserId';
"@

# Save SQL to temp file
$tempSqlFile = Join-Path $env:TEMP "insert-admin-user.sql"
$sql | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    Write-Host "`nExecuting SQL commands..." -ForegroundColor Cyan
    
    # Set password as environment variable to avoid psql prompt
    $env:PGPASSWORD = $DB_PASSWORD
    
    # Execute SQL
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $tempSqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Admin user configured successfully!" -ForegroundColor Green
        Write-Host "`nUser Details:" -ForegroundColor Yellow
        Write-Host $result
        
        Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Use get-admin-token.ps1 to get the JWT token for this admin user" -ForegroundColor White
        Write-Host "2. Update test/helpers/auth.helper.ts with the admin token values" -ForegroundColor White
        Write-Host "3. Run tests again - admin operations should now work!" -ForegroundColor White
    }
    else {
        Write-Host "`n❌ Failed to configure admin user" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Clean up
    Remove-Item -Path $tempSqlFile -ErrorAction SilentlyContinue
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
