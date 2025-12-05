#!/bin/bash

# MedReserve AI Deployment Script
set -e

echo "🏥 Starting MedReserve AI Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to project root
cd "$(dirname "$0")/../.."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set environment
ENVIRONMENT=${1:-development}
print_status "Deploying in $ENVIRONMENT environment"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/uploads/reports
mkdir -p backend/uploads/prescriptions
mkdir -p backend/logs
mkdir -p backend/database/backups

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images (optional)
if [ "$2" = "--clean" ]; then
    print_status "Removing old images..."
    docker system prune -f
    docker image prune -f
fi

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

services=("mysql" "backend" "ml-service" "chatbot-service" "frontend")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*healthy\|$service.*Up"; then
        print_success "$service is healthy"
    else
        print_error "$service is not healthy"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    print_success "All services are healthy!"
    print_status "🎉 MedReserve AI is now running!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8080/api"
    echo "🤖 ML Service: http://localhost:8001"
    echo "💬 Chatbot Service: http://localhost:5005"
    echo "📊 API Documentation: http://localhost:8080/swagger-ui.html"
    echo ""
    print_status "Use 'docker-compose logs -f [service-name]' to view logs"
    print_status "Use 'docker-compose down' to stop all services"
else
    print_error "Some services are not healthy. Check logs with 'docker-compose logs'"
    exit 1
fi
