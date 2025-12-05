# MedReserve Frontend Deployment Script (PowerShell)
# Builds and deploys the React app to GitHub Pages

Write-Host "🚀 Starting MedReserve Frontend Deployment..." -ForegroundColor Blue

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the frontend directory." -ForegroundColor Red
    exit 1
}

try {
    # Clean previous builds
    Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    if (Test-Path "build") { Remove-Item -Recurse -Force "build" }

    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install

    # Run build
    Write-Host "🔨 Building for production..." -ForegroundColor Yellow
    npm run build

    # Check if build was successful
    if (-not (Test-Path "dist")) {
        Write-Host "❌ Build failed: dist directory not found" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Build successful!" -ForegroundColor Green

    # Deploy to GitHub Pages
    Write-Host "🌐 Deploying to GitHub Pages..." -ForegroundColor Yellow
    npm run deploy

    Write-Host "🎉 Deployment complete!" -ForegroundColor Green
    Write-Host "📱 Your app will be available at: https://rishith2903.github.io/MedReserve" -ForegroundColor Cyan
    Write-Host "⏰ Note: It may take a few minutes for changes to appear." -ForegroundColor Yellow

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
