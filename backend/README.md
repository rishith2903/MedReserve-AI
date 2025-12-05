# 🏥 MedReserve — Backend (Spring Boot)

[![CI](https://github.com/rishith2903/MedReserve-AI_Backend/actions/workflows/ci.yml/badge.svg)](https://github.com/rishith2903/MedReserve-AI_Backend/actions)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Maven](https://img.shields.io/badge/Maven-3.9+-blue.svg)](https://maven.apache.org/)

Secure REST API for authentication, users, appointments, medical records, and AI integrations (ML and Chatbot).

See overall architecture diagram: [../docs/architecture.mmd](../docs/architecture.mmd)

## 🌟 Features
- JWT auth with refresh tokens; role-based access (PATIENT, DOCTOR, ADMIN, MASTER_ADMIN)
- Appointments, doctors, patients, medical records
- OpenAPI/Swagger documentation
- Integrations:
  - ML Service (symptom analysis): http://localhost:5001
  - Chatbot Service (assistants + WebSocket): http://localhost:8001
- Health/metrics via Spring Boot Actuator

## 🧰 Tech Stack
- Spring Boot 3.x (Java 17)
- PostgreSQL (Supabase in production) / H2 (dev)
- Spring Security + JWT
- Maven build; JUnit 5/Mockito tests

## 📋 Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL (for production) or H2 (dev)

## 🚀 Run

OS-specific quick reference: see the root README section “OS-specific instructions”.

Windows (PowerShell)
```
cd backend
mvn spring-boot:run
```

macOS/Linux
```
cd backend && mvn spring-boot:run
```

API base (local): http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## 🔧 Configuration (.env example — no secrets)
```
DB_URL=jdbc:postgresql://<host>:5432/<db>?sslmode=require
DB_USERNAME=<db_user>
DB_PASSWORD=<db_password>
SERVER_PORT=8080
JWT_SECRET=<strong-32B+-secret>
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=http://localhost:3000
ML_SERVICE_URL=http://localhost:5001
CHATBOT_SERVICE_URL=http://localhost:8001
```

## 🧪 Testing
```
# All tests
mvn test

# Specific test
mvn test -Dtest=AuthControllerTest
```

## 🐳 Docker (service-only)
```
docker build -t medreserve-backend .
docker run -p 8080:8080 --env-file .env medreserve-backend
```

Tip: Prefer running all services with a root docker-compose (ask me to create it).

## 🔒 Security
- Strong JWT secret (HS256); rotate regularly
- CORS only for trusted origins
- No secrets in repo; use platform secrets or .env (gitignored)

## 🧭 Troubleshooting
- 404 Swagger: ensure app is running; check /actuator/health
- DB connect fails: verify DB_URL and credentials; sslmode=require for Supabase

## 🌐 Production
- Supabase guidance: see ../supabase/README.md
- Example backend URL: https://medreserve-ai-backend.onrender.com (update if different)

## 👥 Demo Accounts (for testing only)
- patient@medreserve.com / password123
- doctor@medreserve.com / password123
- demo@medreserve.com / password123 (ADMIN)
- admin@medreserve.com / MasterAdmin@123 (MASTER_ADMIN)
