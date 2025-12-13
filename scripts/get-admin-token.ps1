# Script to get admin user token from Supabase
# Creates user via admin API and gets JWT token

param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    
    [Parameter(Mandatory = $true)]
    [string]$Password
)

$SUPABASE_URL = "https://gyrajxmdprkxdfhpmxod.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cmFqeG1kcHJreGRmaHBteG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM3NDM2NywiZXhwIjoyMDczOTUwMzY3fQ.8tm_HtOH8hcUtWZWqTnmg_ne7vD28cgWCfMuMamCKOI"

Write-Host "Creating/authenticating admin user: $Email" -ForegroundColor Cyan

$adminHeaders = @{
    "Content-Type"  = "application/json"
    "apikey"        = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
}

$userId = $null
$userCreated = $false

# Try to create user via admin API
try {
    Write-Host "Attempting to create user..." -ForegroundColor Gray
    
    $createBody = @{
        email         = $Email
        password      = $Password
        email_confirm = $true
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users" `
        -Method POST `
        -Headers $adminHeaders `
        -Body $createBody `
        -ErrorAction Stop

    $userId = $createResponse.id
    $userCreated = $true
    Write-Host "✅ User created: $userId" -ForegroundColor Green
}
catch {
    Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Error Details Raw: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    
    $errorDetails = $null
    $errorMessage = ""
    
    if ($_.ErrorDetails.Message) {
        try {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            # Check both 'message' and 'msg' fields
            $errorMessage = if ($errorDetails.message) { $errorDetails.message } else { $errorDetails.msg }
            $errorCode = $errorDetails.error_code
        }
        catch {
            $errorMessage = $_.Exception.Message
        }
    }
    else {
        $errorMessage = $_.Exception.Message
    }
    
    Write-Host "Parsed error: $errorMessage" -ForegroundColor Yellow
    
    if ($errorMessage -like "*already registered*" -or $errorMessage -like "*User already registered*" -or $errorCode -eq "email_exists") {
        Write-Host "⚠️  User already exists. Looking up user..." -ForegroundColor Yellow
        
        # List users and find by email
        try {
            $listResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users" `
                -Method GET `
                -Headers $adminHeaders
            
            $existingUser = $listResponse.users | Where-Object { $_.email -eq $Email } | Select-Object -First 1
            
            if ($existingUser) {
                $userId = $existingUser.id
                Write-Host "✅ Found existing user: $userId" -ForegroundColor Green
            }
            else {
                Write-Host "❌ Could not find user by email" -ForegroundColor Red
                exit 1
            }
        }
        catch {
            Write-Host "❌ Error listing users: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "❌ Error creating user: $errorMessage" -ForegroundColor Red
        exit 1
    }
}

# Now sign in to get JWT token
if ($userId) {
    Write-Host "`nSigning in to get JWT token..." -ForegroundColor Gray
    
    try {
        $signInBody = @{
            email    = $Email
            password = $Password
        } | ConvertTo-Json

        $signInHeaders = @{
            "Content-Type" = "application/json"
            "apikey"       = $SUPABASE_SERVICE_KEY
        }

        $tokenResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/token?grant_type=password" `
            -Method POST `
            -Headers $signInHeaders `
            -Body $signInBody

        if ($tokenResponse.access_token) {
            Write-Host "`n✅ Admin user authenticated successfully!" -ForegroundColor Green
            Write-Host "`nAdmin User Details:" -ForegroundColor Yellow
            Write-Host "===================" -ForegroundColor Yellow
            Write-Host "ID:    $userId" -ForegroundColor White
            Write-Host "Email: $Email" -ForegroundColor White
            Write-Host "`nAccess Token:" -ForegroundColor Yellow
            Write-Host $tokenResponse.access_token -ForegroundColor White
            
            Write-Host "`n📋 Copy these values to test/helpers/auth.helper.ts:" -ForegroundColor Cyan
            Write-Host "const HARDCODED_ADMIN_TOKEN = '$($tokenResponse.access_token)';" -ForegroundColor Gray
            Write-Host "const HARDCODED_ADMIN_ID = '$userId';" -ForegroundColor Gray
            Write-Host "const HARDCODED_ADMIN_EMAIL = '$Email';" -ForegroundColor Gray

            # Decode JWT to show expiry
            try {
                $tokenParts = $tokenResponse.access_token.Split('.')
                if ($tokenParts.Length -ge 2) {
                    $payload = $tokenParts[1]
                    # Add padding if needed
                    $padding = 4 - ($payload.Length % 4)
                    if ($padding -lt 4) {
                        $payload += "=" * $padding
                    }
                    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
                    $payloadJson = $decoded | ConvertFrom-Json
                    $expiryDate = [DateTimeOffset]::FromUnixTimeSeconds($payloadJson.exp).DateTime.ToLocalTime()
                    Write-Host "`n⏰ Token expires: $expiryDate" -ForegroundColor Yellow
                }
            }
            catch {
                Write-Host "`n⚠️  Could not decode token expiry: $($_.Exception.Message)" -ForegroundColor Yellow
            }
            
            Write-Host "`n📝 Next step: Run insert-admin-user.ps1 with this User ID" -ForegroundColor Cyan
        }
        else {
            Write-Host "❌ Failed to get access token" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Sign in error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}
