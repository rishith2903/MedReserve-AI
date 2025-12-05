#!/bin/bash
# Project Cleanup Script for MedReserve AI ML Service
# Removes unnecessary files and optimizes project structure

echo "🧹 Starting project cleanup..."

# Remove Python cache directories
echo "Removing Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
find . -type f -name "*.pyo" -delete 2>/dev/null
find . -type f -name "*.pyd" -delete 2>/dev/null

# Remove .DS_Store files (macOS)
echo "Removing .DS_Store files..."
find . -type f -name ".DS_Store" -delete 2>/dev/null

# Remove temporary files
echo "Removing temporary files..."
find . -type f -name "*~" -delete 2>/dev/null
find . -type f -name "*.bak" -delete 2>/dev/null
find . -type f -name "*.tmp" -delete 2>/dev/null
find . -type f -name "*.swp" -delete 2>/dev/null

# Remove redundant Dockerfile variants (keep only production and simple)
echo "Cleaning up Docker files..."
# Note: Keeping Dockerfile, Dockerfile.production, and Dockerfile.simple

# Remove duplicate requirements files (keep optimized version)
echo "Note: Multiple requirements files present. Consider using requirements-optimized.txt for production."

# Remove test coverage files if they exist
echo "Removing coverage files..."
rm -f .coverage 2>/dev/null
rm -rf htmlcov 2>/dev/null
rm -rf .pytest_cache 2>/dev/null

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf build dist *.egg-info 2>/dev/null

# Create necessary directories if they don't exist
echo "Ensuring necessary directories exist..."
mkdir -p models
mkdir -p logs
mkdir -p dataset
mkdir -p nltk_data

# Set proper permissions
echo "Setting proper permissions..."
chmod +x start.py 2>/dev/null
chmod +x train_all_models.py 2>/dev/null
chmod +x cleanup_project.sh 2>/dev/null

# Display disk usage
echo ""
echo "📊 Project size after cleanup:"
du -sh . 2>/dev/null || echo "Unable to calculate size"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Files to consider removing manually:"
echo "  - DEPLOYMENT_ISSUES_FIXED.md (if no longer needed)"
echo "  - ML_DEPLOYMENT_FIX.md (if no longer needed)"
echo "  - NLTK_DEPLOYMENT_FIX.md (if no longer needed)"
echo "  - deploy-fix.sh (if no longer needed)"
echo "  - setup-ml-repo.sh (if no longer needed)"
echo "  - test_ml_api.py (after testing complete)"
echo "  - Dockerfile.simple (if using production Dockerfile)"
echo "  - Dockerfile.ultra-simple (if using production Dockerfile)"
echo "  - requirements.txt (use requirements-optimized.txt instead)"
echo "  - requirements-minimal.txt (use requirements-optimized.txt instead)"
echo "  - requirements-simple.txt (use requirements-optimized.txt instead)"
echo ""
echo "Recommended: Use requirements-optimized.txt and Dockerfile.production"
