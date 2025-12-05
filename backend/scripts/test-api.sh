#!/bin/bash

# MedReserve AI - API Testing Script
# This script tests all major API endpoints

BASE_URL="http://localhost:8080/api"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local headers=$6

    echo -e "\n${YELLOW}Testing:${NC} $description"
    
    if [ -n "$headers" ]; then
        response=$(curl -s -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "$CONTENT_TYPE" \
            -H "$headers" \
            -d "$data")
    else
        response=$(curl -s -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "$CONTENT_TYPE" \
            -d "$data")
    fi
    
    status_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$status_code" -eq "$expected_status" ]; then
        print_result 0 "$description"
        if [ -n "$response_body" ] && [ "$response_body" != "null" ]; then
            echo "Response: $response_body" | head -c 200
            echo "..."
        fi
    else
        print_result 1 "$description (Expected: $expected_status, Got: $status_code)"
        echo "Response: $response_body"
    fi
}

echo "🧪 Starting MedReserve AI API Tests..."
echo "Base URL: $BASE_URL"

# Test 1: Health Check
test_endpoint "GET" "/actuator/health" "" 200 "Health Check"

# Test 2: User Registration
echo -e "\n📝 Testing User Registration..."
signup_data='{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "1234567890"
}'
test_endpoint "POST" "/auth/signup" "$signup_data" 201 "User Registration"

# Test 3: User Login
echo -e "\n🔐 Testing Authentication..."
login_data='{
    "email": "patient@medreserve.com",
    "password": "password123"
}'

login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "$CONTENT_TYPE" \
    -d "$login_data")

if echo "$login_response" | grep -q "token"; then
    print_result 0 "User Login"
    # Extract token for subsequent requests
    TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    AUTH_HEADER="Authorization: Bearer $TOKEN"
    echo "Token extracted for authenticated requests"
else
    print_result 1 "User Login"
    echo "Response: $login_response"
    AUTH_HEADER=""
fi

# Test 4: Get User Profile (Protected)
if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/users/profile" "" 200 "Get User Profile" "$AUTH_HEADER"
fi

# Test 5: Get Doctors List
test_endpoint "GET" "/doctors" "" 200 "Get Doctors List"

# Test 6: Get Doctor by ID
test_endpoint "GET" "/doctors/1" "" 200 "Get Doctor by ID"

# Test 7: Create Appointment (Protected)
if [ -n "$TOKEN" ]; then
    appointment_data='{
        "doctorId": 1,
        "appointmentDateTime": "2025-07-26T10:00:00",
        "appointmentType": "ONLINE",
        "chiefComplaint": "Test complaint",
        "symptoms": "Test symptoms"
    }'
    test_endpoint "POST" "/appointments" "$appointment_data" 201 "Create Appointment" "$AUTH_HEADER"
fi

# Test 8: Get Patient Appointments (Protected)
if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/appointments/patient/1" "" 200 "Get Patient Appointments" "$AUTH_HEADER"
fi

# Test 9: AI Symptom Analysis (Protected)
if [ -n "$TOKEN" ]; then
    symptom_data='{
        "symptoms": "chest pain, shortness of breath",
        "age": 35,
        "gender": "MALE"
    }'
    test_endpoint "POST" "/ai/symptom-analysis" "$symptom_data" 200 "AI Symptom Analysis" "$AUTH_HEADER"
fi

# Test 10: Chatbot Interaction (Protected)
if [ -n "$TOKEN" ]; then
    chatbot_data='{
        "message": "I have a headache"
    }'
    test_endpoint "POST" "/ai/chatbot" "$chatbot_data" 200 "Chatbot Interaction" "$AUTH_HEADER"
fi

# Test 11: Invalid Endpoint
test_endpoint "GET" "/invalid-endpoint" "" 404 "Invalid Endpoint"

# Test 12: Unauthorized Access
test_endpoint "GET" "/users/profile" "" 401 "Unauthorized Access"

# Test 13: Invalid Login
invalid_login_data='{
    "email": "invalid@example.com",
    "password": "wrongpassword"
}'
test_endpoint "POST" "/auth/login" "$invalid_login_data" 401 "Invalid Login"

# Test 14: Malformed JSON
test_endpoint "POST" "/auth/login" '{"invalid": json}' 400 "Malformed JSON"

# Test 15: Missing Required Fields
incomplete_signup='{
    "firstName": "Test"
}'
test_endpoint "POST" "/auth/signup" "$incomplete_signup" 400 "Missing Required Fields"

# Summary
echo -e "\n📊 Test Summary:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "Total: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n❌ ${RED}Some tests failed.${NC}"
    exit 1
fi
