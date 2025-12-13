# Script to add ensureTestUser() call to all E2E test files
# This ensures the test user is always present before tests run

$testFiles = Get-ChildItem -Path "test" -Filter "*.e2e-spec.ts"

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if ensureTestUser is already called
    if ($content -match "ensureTestUser") {
        Write-Host "✓ $($file.Name) already has ensureTestUser" -ForegroundColor Green
        continue
    }
    
    # Check if file has dbHelper and beforeAll
    if ($content -match "dbHelper\s*=\s*new\s+DatabaseHelper" -and $content -match "beforeAll") {
        # Find the pattern and add ensureTestUser call
        $pattern = "(dbHelper\s*=\s*new\s+DatabaseHelper\([^)]+\);)"
        $replacement = '$1' + "`n`n    // Ensure test user exists before running tests`n    await dbHelper.ensureTestUser();"
        
        $newContent = $content -replace $pattern, $replacement
        
        if ($newContent -ne $content) {
            Set-Content $file.FullName -Value $newContent -NoNewline
            Write-Host "✓ Updated $($file.Name)" -ForegroundColor Cyan
        }
        else {
            Write-Host "⚠ Could not auto-update $($file.Name) - manual check needed" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⊘ $($file.Name) doesn't use dbHelper or beforeAll" -ForegroundColor Gray
    }
}

Write-Host "`n✓ Done! All test files updated." -ForegroundColor Green
