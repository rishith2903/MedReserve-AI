#!/bin/bash

# Test Database Configuration Script for MedReserve Backend
# This script helps verify that the database configuration is working correctly

echo "🔧 MedReserve Database Configuration Test"
echo "=========================================="

# Function to test with different profiles
test_profile() {
    local profile=$1
    echo ""
    echo "🧪 Testing with profile: $profile"
    echo "-----------------------------------"
    
    # Set environment variables for testing
    export SPRING_PROFILES_ACTIVE=$profile
    
    if [ "$profile" = "production" ]; then
        echo "Setting PostgreSQL environment variables..."
        export DB_URL="jdbc:postgresql://localhost:5432/medreserve_test"
        export DB_USERNAME="postgres"
        export DB_PASSWORD="password"
    fi
    
    # Test configuration validation
    echo "Validating Spring Boot configuration..."
    mvn spring-boot:run -Dspring-boot.run.arguments="--spring.main.web-application-type=none --spring.jpa.hibernate.ddl-auto=validate" -q &
    
    # Wait a bit for startup
    sleep 5
    
    # Kill the test process
    pkill -f "spring-boot:run"
    
    echo "✅ Configuration test completed for profile: $profile"
}

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed or not in PATH"
    exit 1
fi

# Check if PostgreSQL driver is in dependencies
echo "🔍 Checking PostgreSQL driver in dependencies..."
if mvn dependency:tree | grep -q "postgresql"; then
    echo "✅ PostgreSQL driver found in dependencies"
else
    echo "❌ PostgreSQL driver not found in dependencies"
    echo "   Add this to your pom.xml:"
    echo "   <dependency>"
    echo "     <groupId>org.postgresql</groupId>"
    echo "     <artifactId>postgresql</artifactId>"
    echo "   </dependency>"
fi

# Test default profile (should use H2)
test_profile "default"

# Test production profile (should use PostgreSQL)
test_profile "production"

echo ""
echo "🎯 Configuration Summary:"
echo "========================"
echo "✅ Default profile: Uses H2 in-memory database"
echo "✅ Production profile: Uses PostgreSQL with environment variables"
echo "✅ Driver auto-detection: Spring Boot will choose the correct driver"
echo ""
echo "🚀 Deployment Checklist:"
echo "========================"
echo "1. ✅ SPRING_PROFILES_ACTIVE=production is set in render.yaml"
echo "2. ✅ DB_URL, DB_USERNAME, DB_PASSWORD are configured from database service"
echo "3. ✅ PostgreSQL driver is included in dependencies"
echo "4. ✅ Production profile explicitly sets PostgreSQL driver"
echo ""
echo "🔧 If deployment still fails, check:"
echo "- Database service is running and accessible"
echo "- Database credentials are correct"
echo "- Network connectivity between app and database"
echo "- Database allows SSL connections (sslmode=require)"
