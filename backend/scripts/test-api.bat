@echo off
REM MedReserve AI - API Testing Script for Windows
REM This script tests all major API endpoints

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:8080/api
set CONTENT_TYPE=Content-Type: application/json

REM Test counters
set TESTS_PASSED=0
set TESTS_FAILED=0

echo 🧪 Starting MedReserve AI API Tests...
echo Base URL: %BASE_URL%

REM Function to test endpoint
:test_endpoint
set method=%1
set endpoint=%2
set data=%3
set expected_status=%4
set description=%5
set headers=%6

echo.
echo Testing: %description%

if "%headers%"=="" (
    curl -s -w "%%{http_code}" -X %method% "%BASE_URL%%endpoint%" -H "%CONTENT_TYPE%" -d %data% > temp_response.txt
) else (
    curl -s -w "%%{http_code}" -X %method% "%BASE_URL%%endpoint%" -H "%CONTENT_TYPE%" -H "%headers%" -d %data% > temp_response.txt
)

REM Extract status code (last 3 characters)
for /f %%i in ('powershell -command "Get-Content temp_response.txt | ForEach-Object { $_.Substring($_.Length - 3) }"') do set status_code=%%i

if "%status_code%"=="%expected_status%" (
    echo ✓ PASS: %description%
    set /a TESTS_PASSED+=1
) else (
    echo ✗ FAIL: %description% ^(Expected: %expected_status%, Got: %status_code%^)
    set /a TESTS_FAILED+=1
    type temp_response.txt
)

del temp_response.txt 2>nul
goto :eof

REM Test 1: Health Check
call :test_endpoint "GET" "/actuator/health" "" "200" "Health Check"

REM Test 2: User Registration
echo.
echo 📝 Testing User Registration...
set signup_data={"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","phoneNumber":"1234567890"}
call :test_endpoint "POST" "/auth/signup" "%signup_data%" "201" "User Registration"

REM Test 3: User Login
echo.
echo 🔐 Testing Authentication...
set login_data={"email":"patient@medreserve.com","password":"password123"}

curl -s -X POST "%BASE_URL%/auth/login" -H "%CONTENT_TYPE%" -d "%login_data%" > login_response.txt

findstr "token" login_response.txt >nul
if %errorlevel%==0 (
    echo ✓ PASS: User Login
    set /a TESTS_PASSED+=1
    REM Extract token (simplified for batch)
    for /f "tokens=2 delims=:" %%a in ('findstr "token" login_response.txt') do (
        set token_part=%%a
        set token=!token_part:"=!
        set token=!token:,=!
        set token=!token: =!
    )
    set AUTH_HEADER=Authorization: Bearer !token!
    echo Token extracted for authenticated requests
) else (
    echo ✗ FAIL: User Login
    set /a TESTS_FAILED+=1
    type login_response.txt
)

del login_response.txt 2>nul

REM Test 4: Get User Profile (Protected)
if defined token (
    call :test_endpoint "GET" "/users/profile" "" "200" "Get User Profile" "!AUTH_HEADER!"
)

REM Test 5: Get Doctors List
call :test_endpoint "GET" "/doctors" "" "200" "Get Doctors List"

REM Test 6: Get Doctor by ID
call :test_endpoint "GET" "/doctors/1" "" "200" "Get Doctor by ID"

REM Test 7: Create Appointment (Protected)
if defined token (
    set appointment_data={"doctorId":1,"appointmentDateTime":"2025-07-26T10:00:00","appointmentType":"ONLINE","chiefComplaint":"Test complaint","symptoms":"Test symptoms"}
    call :test_endpoint "POST" "/appointments" "!appointment_data!" "201" "Create Appointment" "!AUTH_HEADER!"
)

REM Test 8: Get Patient Appointments (Protected)
if defined token (
    call :test_endpoint "GET" "/appointments/patient/1" "" "200" "Get Patient Appointments" "!AUTH_HEADER!"
)

REM Test 9: AI Symptom Analysis (Protected)
if defined token (
    set symptom_data={"symptoms":"chest pain, shortness of breath","age":35,"gender":"MALE"}
    call :test_endpoint "POST" "/ai/symptom-analysis" "!symptom_data!" "200" "AI Symptom Analysis" "!AUTH_HEADER!"
)

REM Test 10: Chatbot Interaction (Protected)
if defined token (
    set chatbot_data={"message":"I have a headache"}
    call :test_endpoint "POST" "/ai/chatbot" "!chatbot_data!" "200" "Chatbot Interaction" "!AUTH_HEADER!"
)

REM Test 11: Invalid Endpoint
call :test_endpoint "GET" "/invalid-endpoint" "" "404" "Invalid Endpoint"

REM Test 12: Unauthorized Access
call :test_endpoint "GET" "/users/profile" "" "401" "Unauthorized Access"

REM Test 13: Invalid Login
set invalid_login_data={"email":"invalid@example.com","password":"wrongpassword"}
call :test_endpoint "POST" "/auth/login" "%invalid_login_data%" "401" "Invalid Login"

REM Test 14: Missing Required Fields
set incomplete_signup={"firstName":"Test"}
call :test_endpoint "POST" "/auth/signup" "%incomplete_signup%" "400" "Missing Required Fields"

REM Summary
echo.
echo 📊 Test Summary:
echo Passed: %TESTS_PASSED%
echo Failed: %TESTS_FAILED%
set /a TOTAL=%TESTS_PASSED%+%TESTS_FAILED%
echo Total: %TOTAL%

if %TESTS_FAILED%==0 (
    echo.
    echo 🎉 All tests passed!
    exit /b 0
) else (
    echo.
    echo ❌ Some tests failed.
    exit /b 1
)

endlocal
