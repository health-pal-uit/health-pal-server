#!/usr/bin/env pwsh
# Quick script to refresh test token

$API_URL = "http://localhost:3001"
$TEST_EMAIL = "test-e2e@healthpal.com"
$TEST_PASSWORD = "Test123!@#"
$AUTH_HELPER_PATH = "test/helpers/auth.helper.ts"

Write-Host "Refreshing test token..." -ForegroundColor Cyan

# Login
$loginBody = @{
    email    = $TEST_EMAIL
    password = $TEST_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$API_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    $token = $loginResponse.data.token
    
    # Get user info
    $userResponse = Invoke-RestMethod `
        -Uri "$API_URL/users/me" `
        -Method GET `
        -Headers @{Authorization = "Bearer $token" } `
        -ErrorAction Stop
    
    $userId = $userResponse.data.id
    $userEmail = $userResponse.data.email
    
    # Read auth helper file
    $content = Get-Content $AUTH_HELPER_PATH -Raw
    
    # Replace token
    $content = $content -replace "const HARDCODED_TOKEN = '[^']*';", "const HARDCODED_TOKEN = '$token';"
    $content = $content -replace "const HARDCODED_USER_ID = '[^']*';", "const HARDCODED_USER_ID = '$userId';"
    $content = $content -replace "const HARDCODED_EMAIL = '[^']*';", "const HARDCODED_EMAIL = '$userEmail';"
    
    # Write back
    Set-Content $AUTH_HELPER_PATH -Value $content -NoNewline
    
    Write-Host "✓ Token updated successfully!" -ForegroundColor Green
    Write-Host "  File: $AUTH_HELPER_PATH" -ForegroundColor Gray
    Write-Host "  User: $userEmail ($userId)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You can now run: npm run test:e2e" -ForegroundColor Yellow
    
}
catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure server is running: npm run start:dev" -ForegroundColor Yellow
}
