param(
  [switch]$NoHealthCheck
)
$ErrorActionPreference = 'Stop'

# Paths
$backend = (Resolve-Path "$PSScriptRoot\..\").Path.TrimEnd('\')
$dotenv  = Join-Path $backend '.env'

Write-Host "Loading environment from: $dotenv" -ForegroundColor Cyan
if (Test-Path $dotenv) {
  Get-Content $dotenv | ForEach-Object {
    $line = $_.Trim()
    if (-not [string]::IsNullOrWhiteSpace($line) -and -not $line.StartsWith('#')) {
      $kv = $line -split '=',2
      if ($kv.Length -eq 2) {
        $name = $kv[0].Trim()
        $value = $kv[1].Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
      }
    }
  }
} else {
  Write-Warning "No .env file found at $dotenv"
}

# Force production profile by default
if (-not $env:SPRING_PROFILES_ACTIVE) { $env:SPRING_PROFILES_ACTIVE = 'production' }

# If DB_URL not set, fail fast
if (-not $env:DB_URL) { throw 'DB_URL is not set. Please set it in backend/.env.' }
if (-not $env:DB_USERNAME) { throw 'DB_USERNAME is not set. Please set it in backend/.env.' }
if (-not $env:DB_PASSWORD) { throw 'DB_PASSWORD is not set. Please set it in backend/.env.' }
if (-not $env:JWT_SECRET) { throw 'JWT_SECRET is not set. Please set it in backend/.env.' }

# Minimal visibility: echo only the host part of DB_URL for debugging
try {
  $u = [Uri]$env:DB_URL.Replace('jdbc:','')
  Write-Host ("DB Host: {0}:{1}  Profile: {2}" -f $u.Host,$u.Port,$env:SPRING_PROFILES_ACTIVE) -ForegroundColor Green
} catch { Write-Host "Using configured DB_URL. (Host parse not available)" -ForegroundColor Green }

# Build once (skip tests for speed)
Write-Host 'Building backend (skip tests)...' -ForegroundColor Yellow
& mvn -q -f (Join-Path $backend 'pom.xml') -DskipTests clean package

# Run Spring Boot
Write-Host 'Starting Spring Boot...' -ForegroundColor Yellow
$target = Join-Path $backend 'target'
New-Item -ItemType Directory -Force -Path $target | Out-Null
$logOut = Join-Path $target 'spring-boot-run.out.log'
$logErr = Join-Path $target 'spring-boot-run.err.log'
if (Test-Path $logOut) { Remove-Item $logOut -Force }
if (Test-Path $logErr) { Remove-Item $logErr -Force }
$proc = Start-Process -FilePath "mvn" -ArgumentList "-q","-f",(Join-Path $backend 'pom.xml'),"-DskipTests","spring-boot:run" -WorkingDirectory $backend -RedirectStandardOutput $logOut -RedirectStandardError $logErr -WindowStyle Hidden -PassThru

if (-not $NoHealthCheck) {
  # Poll health for up to ~90 seconds
  $up = $false
  1..30 | ForEach-Object {
    Start-Sleep -Seconds 3
    try {
      $resp = Invoke-WebRequest -UseBasicParsing http://localhost:8080/actuator/health -TimeoutSec 3
      if ($resp.StatusCode -eq 200) { $up = $true; break }
    } catch { }
  }
  if ($up) {
    Write-Host 'Health: UP' -ForegroundColor Green
  } else {
    Write-Warning 'Health endpoint not reachable yet. Showing last logs:'
    if (Test-Path $logErr) { Write-Host '--- ERR ---' -ForegroundColor Yellow; Get-Content $logErr -Tail 100 }
    if (Test-Path $logOut) { Write-Host '--- OUT ---' -ForegroundColor Yellow; Get-Content $logOut -Tail 100 }
  }
}
