#!/usr/bin/env pwsh
# Get fresh token for existing user

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Get Fresh Token" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get credentials
$email = Read-Host "Enter your email (hankhongg@gmail.com)"
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "hankhongg@gmail.com"
}

$password = Read-Host "Enter your password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Logging in..." -ForegroundColor Yellow

try {
    $loginBody = @{
        email    = $email
        password = $passwordPlain
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod `
        -Uri "http://localhost:3001/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    $token = $loginResponse.data.token

    # Get user info
    $userResponse = Invoke-RestMethod `
        -Uri "http://localhost:3001/users/me" `
        -Method GET `
        -Headers @{Authorization = "Bearer $token" } `
        -ErrorAction Stop

    $userId = $userResponse.data.id
    $userEmail = $userResponse.data.email

    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User ID: $userId" -ForegroundColor White
    Write-Host "Email:   $userEmail" -ForegroundColor White
    Write-Host ""
    Write-Host "Token:" -ForegroundColor Yellow
    Write-Host $token -ForegroundColor Gray
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "Copy these to test/helpers/auth.helper.ts:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "const HARDCODED_TOKEN = '$token';" -ForegroundColor Green
    Write-Host "const HARDCODED_USER_ID = '$userId';" -ForegroundColor Green
    Write-Host "const HARDCODED_EMAIL = '$userEmail';" -ForegroundColor Green
    Write-Host ""

}
catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
