param([string]$BackendLogDirectory)
$ErrorActionPreference = 'Stop'

if ($BackendLogDirectory) {
  $env:HP_BACKEND_LOG_DIR = (Resolve-Path -LiteralPath $BackendLogDirectory).Path
}
$taskLogDirectory = if ($env:HP_BACKEND_LOG_DIR) { $env:HP_BACKEND_LOG_DIR } else {
  [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../.cache/recognition-performance-20261122'))
}
foreach ($taskLogName in @('backend.stdout.log', 'backend.stderr.log')) {
  if (-not (Test-Path -LiteralPath (Join-Path $taskLogDirectory $taskLogName) -PathType Leaf)) {
    throw "Start the backend with stdout/stderr redirected first. Missing: $taskLogName"
  }
}
$taskSecretPath = Join-Path $PSScriptRoot '.grafana-admin-password.local'
if (-not (Test-Path -LiteralPath $taskSecretPath)) {
  $taskSecret = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
  [IO.File]::WriteAllText($taskSecretPath, $taskSecret, [Text.UTF8Encoding]::new($false))
}

$taskCompose = Join-Path $PSScriptRoot 'compose.local.yaml'
docker compose -f $taskCompose config --quiet
if ($LASTEXITCODE -ne 0) { throw 'Monitoring Compose validation failed.' }
docker compose -f $taskCompose up -d
if ($LASTEXITCODE -ne 0) { throw 'Monitoring startup failed; check Docker Desktop.' }

Write-Host 'Grafana: http://127.0.0.1:3000/d/healthpal-recognition/healthpal-recognition'
Write-Host 'Loki: http://127.0.0.1:3100/ready | Alloy: http://127.0.0.1:12345'
Write-Host 'Only recognition forwarding events are collected; backend/AI must run separately.'
