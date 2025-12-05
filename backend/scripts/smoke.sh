#!/usr/bin/env bash
set -euo pipefail
BASE_URL=${1:-http://localhost:8080}
ORIGIN=${2:-http://localhost:3000}
CORS_PATH=${3:-/doctors}

echo "Checking health..."
curl -sf "${BASE_URL}/actuator/health" | grep -q UP && echo "Health OK" || { echo "Health not UP"; exit 1; }

echo "Checking CORS preflight..."
if ! curl -is -X OPTIONS "${BASE_URL}${CORS_PATH}" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: GET" | head -n 1; then
  echo "Preflight request failed (choose a different path or check CORS config)"
fi

echo "Smoke tests completed"
