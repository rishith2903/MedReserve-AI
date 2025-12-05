# MedReserve Backend – Hardening Phase 1

Status: In progress
Branch: chore/backend-hardening-phase1
Date: 2025-09-21

Goals
- Establish a clean baseline build on Java 17
- Verify toolchain and wrappers (Maven wrapper not present; use Maven CLI)
- Inventory and lock down risky areas (JWT, CORS, health checks, security rules)

Baseline findings (from code audit)
- Health path: /actuator/health
  - application.yml: management.endpoints.web.base-path: /actuator
  - HealthController maps /actuator/health
  - Dockerfile HEALTHCHECK hits /actuator/health
  - Render healthCheckPath is /actuator/health
- JWT secret enforcement: present
  - security.jwt.secret property is bound from env JWT_SECRET
  - JwtSecretConfig validates non-empty and >= 32 bytes and exposes SecretKey bean
  - Tests: JwtSecretConfigTest covers missing/short/valid cases
- CORS centralization: present
  - SecurityConfig defines CorsConfigurationSource with app.cors.allowed-origins (and env fallback CORS_ALLOWED_ORIGINS)
  - No @CrossOrigin annotations found in controllers
- Security rules
  - CSRF disabled; stateless sessions
  - /actuator/health and /actuator/info permitted
  - Doctor endpoints guarded; method-level @PreAuthorize uses @authzService.isSelfDoctorId
  - JWT filter registered before UsernamePasswordAuthenticationFilter
- External services
  - RestTemplate configured with connect/read timeouts via properties
  - MLService and ChatbotService implement try/catch with sensible fallbacks
- Profiles/config
  - application.yml (default/dev), application-production.yml, application-test.yml present
  - Consider adding application-dev.yml for dev DX (logging levels)
- Build tool
  - Maven project (pom.xml); no mvnw/gradlew wrappers found

Verification commands (PowerShell)
- Build: mvn -q -DskipTests clean package
- Local run (example): mvn -q spring-boot:run
- Health: Invoke-WebRequest -UseBasicParsing http://localhost:8080/actuator/health
- Preflight (dev origin):
  $headers = @{ "Origin" = "http://localhost:3000"; "Access-Control-Request-Method" = "GET" }
  Invoke-WebRequest -UseBasicParsing -Method Options -Headers $headers -Uri "http://localhost:8080/doctors"

Open items
- README contains a stray /api/actuator/health reference → standardize to /actuator/health
- Add .dockerignore to reduce build context
- Add smoke-test scripts for local and container checks
- Add CI workflow (build, test, Docker build, Trivy scan)
- Optional: add application-dev.yml for dev logging

Notes / Observations
- Use JWT secrets >= 32 bytes (HS256); suggest generation via: openssl rand -base64 48
- Prefer app.cors.allowed-origins (FRONTEND_ORIGINS env) for CORS; avoid legacy cors.allowed-origins property
- Keep actuator on service port for Render health checks

## Tooling versions (captured)
### Java
java : java version "24.0.2" 2025-07-15
At line:1 char:2
+ (java -version) 2>&1 | Out-String | Add-Content -Path "backend\docs\b ...
+  ~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (java version "24.0.2" 2025-07-15:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
Java(TM) SE Runtime Environment (build 24.0.2+12-54)
Java HotSpot(TM) 64-Bit Server VM (build 24.0.2+12-54, mixed mode, sharing)


### Maven
Apache Maven 3.9.11 (3e54c93a704957b63ee3494413a2b544fd3d825b)
Maven home: C:\Users\sai sumanth\apache-maven-3.9.11-bin\apache-maven-3.9.11
Java version: 24.0.2, vendor: Oracle Corporation, runtime: C:\Program Files\Java\jdk-24
Default locale: en_IN, platform encoding: UTF-8
OS name: "windows 11", version: "10.0", arch: "amd64", family: "windows"

