param(
  [string]$BaseUrl = 'http://localhost:8080',
  [string]$Origin = 'http://localhost:3000',
  [string]$PathForCors = '/doctors'
)
$ErrorActionPreference = 'Stop'

Write-Host 'Checking health...' -ForegroundColor Cyan
$health = Invoke-WebRequest -UseBasicParsing -Uri ($BaseUrl + '/actuator/health') -TimeoutSec 8
# Coerce content to string in case it is a byte[]
if ($health.Content -is [byte[]]) { $healthText = [System.Text.Encoding]::UTF8.GetString($health.Content) } else { $healthText = [string]$health.Content }
if ($healthText -notmatch 'UP') {
  Write-Error 'Health not UP'
  exit 1
} else {
  Write-Host 'Health OK' -ForegroundColor Green
}

Write-Host 'Checking CORS preflight...' -ForegroundColor Cyan
$headers = @{ 'Origin' = $Origin; 'Access-Control-Request-Method' = 'GET' }
try {
  $pre = Invoke-WebRequest -UseBasicParsing -Method Options -Headers $headers -Uri ($BaseUrl + $PathForCors) -TimeoutSec 5
  Write-Host ("Preflight status: {0}" -f $pre.StatusCode) -ForegroundColor Green
} catch {
  Write-Warning 'Preflight request failed, inspect server CORS config or choose a different path'
}

Write-Host 'Smoke tests completed' -ForegroundColor Green
