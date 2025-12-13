#!/usr/bin/env pwsh
# Setup Test User for E2E Tests

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test User Setup for E2E Tests" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = "http://localhost:3001"
$TEST_EMAIL = "test-e2e@healthpal.com"
$TEST_PASSWORD = "Test123!@#"

# Check if server is running
Write-Host "[1/4] Checking if server is running..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "$API_URL/" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ Server is running!" -ForegroundColor Green
}
catch {
    Write-Host "✗ Server is not running!" -ForegroundColor Red
    Write-Host "Please run: npm run start:dev" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Signup test user
Write-Host "[2/4] Creating test user..." -ForegroundColor Yellow
$signupBody = @{
    email      = $TEST_EMAIL
    password   = $TEST_PASSWORD
    name       = "E2E Test User"
    birth_date = "1990-01-01"
    gender     = "MALE"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod `
        -Uri "$API_URL/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupBody `
        -ErrorAction Stop
    
    Write-Host "✓ Test user created!" -ForegroundColor Green
    Write-Host "  Email: $TEST_EMAIL" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "! Test user already exists (this is OK)" -ForegroundColor Yellow
    }
    else {
        Write-Host "✗ Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Login and get token
Write-Host "[3/4] Logging in and getting token..." -ForegroundColor Yellow
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
    
    if ($token) {
        Write-Host "✓ Login successful!" -ForegroundColor Green
    }
    else {
        Write-Host "✗ No token received" -ForegroundColor Red
        Write-Host "Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "This might be because:" -ForegroundColor Yellow
    Write-Host "  - Email needs verification in Supabase" -ForegroundColor Yellow
    Write-Host "  - Password is incorrect" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Go to: https://gyrajxmdprkxdfhpmxod.supabase.co" -ForegroundColor Cyan
    Write-Host "Navigate to: Authentication → Users" -ForegroundColor Cyan
    Write-Host "Find: $TEST_EMAIL" -ForegroundColor Cyan
    Write-Host "Toggle: Email Verified = ON" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Get user info
Write-Host "[4/4] Getting user info..." -ForegroundColor Yellow
try {
    $userResponse = Invoke-RestMethod `
        -Uri "$API_URL/users/me" `
        -Method GET `
        -Headers @{Authorization = "Bearer $token" } `
        -ErrorAction Stop
    
    $userId = $userResponse.data.id
    $userEmail = $userResponse.data.email
    
    Write-Host "✓ User info retrieved!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "Test User Details" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "User ID:  $userId" -ForegroundColor White
    Write-Host "Email:    $userEmail" -ForegroundColor White
    Write-Host ""
    Write-Host "Token (first 50 chars):" -ForegroundColor White
    Write-Host $token.Substring(0, [Math]::Min(50, $token.Length)) -ForegroundColor Gray
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "Next Steps" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Update test/helpers/auth.helper.ts:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   const HARDCODED_TOKEN = '$token';" -ForegroundColor Green
    Write-Host "   const HARDCODED_USER_ID = '$userId';" -ForegroundColor Green
    Write-Host "   const HARDCODED_EMAIL = '$userEmail';" -ForegroundColor Green
    Write-Host ""
    Write-Host "2. Run tests:" -ForegroundColor Yellow
    Write-Host "   npm run test:e2e" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token expires in 1 hour. Re-run this script to get a fresh token." -ForegroundColor Gray
    Write-Host ""
    
}
catch {
    Write-Host "✗ Failed to get user info: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}
