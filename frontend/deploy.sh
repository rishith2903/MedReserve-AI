#!/bin/bash

# MedReserve Frontend Deployment Script
# Builds and deploys the React app to GitHub Pages

set -e  # Exit on any error

echo "🚀 Starting MedReserve Frontend Deployment..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if gh-pages is installed
if ! npm list gh-pages > /dev/null 2>&1; then
    echo "📦 Installing gh-pages..."
    npm install --save-dev gh-pages
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist build

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run build
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

echo "🎉 Deployment complete!"
echo "📱 Your app will be available at: https://rishith2903.github.io/MedReserve"
echo "⏰ Note: It may take a few minutes for changes to appear."
