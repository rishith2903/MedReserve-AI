

<h1 align="center">🏥 MedReserve AI</h1>

<p align="center">
  <strong>An AI-Powered Healthcare Management Platform for Intelligent Doctor-Patient Interactions</strong>
</p>

<p align="center">
  <a href="https://med-reserve-ai.vercel.app/"><img src="https://img.shields.io/badge/Frontend-Live-brightgreen?style=for-the-badge" alt="Frontend Live" /></a>
  <a href="https://medreserve-ai.onrender.com"><img src="https://img.shields.io/badge/Backend-Live-blue?style=for-the-badge" alt="Backend Live" /></a>
  <img src="https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk" alt="Java 17" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python" alt="Python 3.10+" />
</p>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Live Demo](#-live-demo)
3. [Screenshots](#-screenshots)
4. [Features](#-features)
5. [Tech Stack](#-tech-stack)
6. [Project Architecture](#-project-architecture)
7. [Folder Structure](#-folder-structure)
8. [Installation](#-installation)
9. [Environment Variables](#-environment-variables)
10. [API Documentation](#-api-documentation)
11. [Dataset Details](#-dataset-details)
12. [Model Details](#-model-details)
13. [Challenges & Learnings](#-challenges--learnings)
14. [Future Improvements](#-future-improvements)
15. [Contributors](#-contributors)
16. [License](#-license)

---

## 🎯 Project Overview

**MedReserve AI** is a comprehensive, production-ready healthcare management platform that bridges the gap between patients and healthcare providers through intelligent automation and AI-driven insights. The platform streamlines the entire healthcare journey—from symptom analysis and doctor discovery to appointment booking, real-time consultations, and prescription management.

This platform is designed for **patients** seeking quick, reliable healthcare access without the hassle of traditional queuing systems, and for **doctors** looking to efficiently manage their practice, patient records, and clinical workflows. Administrators can oversee the entire ecosystem with robust dashboards and analytics.

The core differentiator is its **AI/ML integration**: a symptom-to-specialization prediction engine powered by Random Forest classifiers with TF-IDF vectorization recommends the most appropriate medical specialists based on patient symptoms. Additionally, role-aware chatbots (Patient Chatbot & Doctor Chatbot) provide 24/7 conversational support for appointment booking, prescription queries, and clinical decision assistance—all built with Python FastAPI microservices.

---

## 📊 Project Statistics

<table>
  <tr>
    <td align="center">
      <h3>65+</h3>
      <sub>REST API Endpoints</sub>
    </td>
    <td align="center">
      <h3>16</h3>
      <sub>Controllers</sub>
    </td>
    <td align="center">
      <h3>91</h3>
      <sub>Java Classes</sub>
    </td>
    <td align="center">
      <h3>74</h3>
      <sub>React Components</sub>
    </td>
    <td align="center">
      <h3>60+</h3>
      <sub>Unit/Integration Tests</sub>
    </td>
  </tr>
</table>

### Codebase Breakdown

| Category | Component | Count |
|----------|-----------|-------|
| **Backend** | REST Controllers | 16 |
| | API Endpoints | 65+ |
| | DTOs (Data Transfer Objects) | 25+ |
| | Service Classes | 12+ |
| | JPA Entities | 8+ |
| | Test Files | 12 |
| | Unit/Integration Tests | 60+ |
| **Frontend** | React Components | 74 |
| | Pages | 25+ |
| | Custom Hooks | 4 |
| | Context Providers | 2 |
| **AI/ML** | Python Microservices | 2 |
| | ML Models | 3 |
| | API Endpoints | 10+ |

### API Endpoints by Domain

| Domain | Endpoints | Key Features |
|--------|-----------|--------------|
| 🔐 Authentication | 8 | Login, Signup, JWT Refresh, Password Change |
| 📅 Appointments | 8 | Booking, Reschedule, Cancel, Doctor Slots |
| 👨‍⚕️ Doctors | 12 | Search, Filter, Top-rated, Specialties |
| 🏥 Disease Prediction | 6 | ML/DL Predict, Compare, Analyze |
| 💬 Chat & Chatbot | 12 | Sessions, Messages, Webhook, Intents |
| 📋 Medical Records | 6 | Reports, Prescriptions, Upload |
| 🤖 AI Features | 5 | Symptom Analysis, Health Tips, Smart Features |
| ⚙️ System | 8 | Health Checks, Debug, CORS, Config |

---

## 🌐 Live Demo

| Service | URL | Status |
|---------|-----|--------|
| 🖥️ **Frontend** | [https://med-reserve-ai.vercel.app](https://med-reserve-ai.vercel.app/) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |
| ⚙️ **Backend API** | [https://medreserve-ai.onrender.com](https://medreserve-ai.onrender.com) | ![Live](https://img.shields.io/badge/status-live-blue) |
| 📚 **API Docs** | [https://medreserve-ai.onrender.com/api/swagger-ui.html](https://medreserve-ai.onrender.com/api/swagger-ui.html) | ![Docs](https://img.shields.io/badge/swagger-available-green) |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 Patient | `patient@medreserve.com` | `password123` |
| 👨‍⚕️ Doctor | `doctor@medreserve.com` | `password123` |
| 🔧 Admin | `admin@medreserve.com` | `password123` |
| 🛡️ Master Admin | `masteradmin@medreserve.com` | `password123` |

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="./screenshots/landing.png" alt="Landing Page" />
      <br /><strong>Landing Page</strong>
    </td>
    <td align="center" width="50%">
      <img src="./screenshots/dashboard.png" alt="Patient Dashboard" />
      <br /><strong>Patient Dashboard</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="./screenshots/symptom-checker.png" alt=" AI Symptom Checker" />
      <br /><strong>AI Symptom Checker</strong>
    </td>
    <td align="center" width="50%">
      <img src="./screenshots/doctor-dashboard.png" alt="Doctor Dashboard" />
      <br /><strong>Doctor Dashboard</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="./screenshots/chatbot.png" alt="AI Healthcare Chatbot" />
      <br /><strong>AI Healthcare Chatbot</strong>
    </td>
    <td align="center" width="50%">
      <img src="./screenshots/appointments.png" alt="Appointment Booking" />
      <br /><strong>Appointment Booking</strong>
    </td>
  </tr>
</table>

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh token rotation
- Role-based access control (Patient, Doctor, Admin, Master Admin)
- Secure password hashing with BCrypt
- Session management and token blacklisting

### 👥 User Management
- Patient registration with profile management
- Doctor profiles with specializations and availability slots
- Admin dashboard for user oversight
- Real-time user statistics and analytics

### 📅 Appointment System
- Smart appointment booking with conflict detection
- Doctor availability and time slot management
- Real-time notifications and email reminders
- Appointment history and rescheduling

### 🏥 Medical Records
- Electronic health records (EHR) management
- Medical report upload with secure storage
- Prescription management and tracking
- Complete patient medical history

### 🤖 AI-Powered Features
- **Symptom Checker**: ML-powered symptom analysis recommending appropriate medical specialists
- **Healthcare Chatbot**: Dual-mode AI assistant (Patient & Doctor) for 24/7 support
- **Disease Prediction**: Multi-class classification for preliminary diagnosis insights
- **Smart Recommendations**: Context-aware health tips and advice

### 📊 Analytics & Reporting
- Real-time dashboards with healthcare KPIs
- Patient and doctor performance analytics
- Appointment trends and utilization metrics
- System health monitoring with Actuator

### 🔒 Security & Compliance
- HIPAA-aligned data handling practices
- Encrypted data transmission (HTTPS/TLS)
- Audit logging and access tracking
- Rate limiting with Bucket4j

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 5.4 | Build Tool & Dev Server |
| Material-UI 7 | Component Library |
| React Query (TanStack) | Server State Management |
| React Router 7 | Client-side Routing |
| Recharts | Data Visualization |
| Axios | HTTP Client |
| Socket.io Client | Real-time Communication |

### Backend
| Technology | Purpose |
|------------|---------|
| Spring Boot 3.2.0 | Application Framework |
| Java 17 | Programming Language |
| Spring Security | Authentication & Authorization |
| Spring Data JPA | ORM & Data Access |
| Spring WebSocket | Real-time Messaging |
| Spring Mail | Email Notifications |
| Springdoc OpenAPI | API Documentation |
| Resilience4j | Circuit Breaker & Retry |
| Caffeine | Caching Layer |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL 15+ | Production Database |
| H2 Database | Development/Testing |

### AI/ML Services
| Technology | Purpose |
|------------|---------|
| Python 3.10+ | ML Service Runtime |
| FastAPI | ML API Framework |
| Scikit-learn | Machine Learning Models |
| NLTK | Natural Language Processing |
| Pandas/NumPy | Data Processing |
| Joblib | Model Serialization |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Vercel | Frontend Hosting |
| Render | Backend & ML Hosting |
| GitHub Actions | CI/CD Pipeline |
| Nginx | Reverse Proxy |

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    React 19 + Vite Frontend                         │    │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │    │
│  │   │  Pages   │  │Components│  │  Hooks   │  │ Services (Axios) │    │    │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS/REST + WebSocket
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              Spring Boot 3.2 Backend (Java 17)                      │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────┐   │    │
│  │   │ Controllers│  │  Services  │  │Repositories│  │  Security   │   │    │
│  │   │  (REST)    │  │  (Logic)   │  │   (JPA)    │  │  (JWT/RBAC) │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └─────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└───────────────┬─────────────────────────────────────┬───────────────────────┘
                │                                     │
                ▼                                     ▼
┌───────────────────────────────┐     ┌───────────────────────────────────────┐
│       DATABASE LAYER          │     │            AI/ML SERVICES             │
│  ┌─────────────────────────┐  │     │  ┌─────────────────────────────────┐  │
│  │    PostgreSQL 15        │  │     │  │     ML Service (FastAPI)        │  │
│  │  ┌───────┐  ┌────────┐  │  │     │  │  ┌─────────────┐  ┌──────────┐  │  │
│  │  │ Users │  │Appoint-│  │  │     │  │  │ Symptom     │  │ Disease  │  │  │
│  │  │       │  │ ments  │  │  │     │  │  │ Predictor   │  │ Predictor│  │  │
│  │  ├───────┤  ├────────┤  │  │     │  │  └─────────────┘  └──────────┘  │  │
│  │  │Doctors│  │Prescrip│  │  │     │  └─────────────────────────────────┘  │
│  │  │       │  │ -tions │  │  │     │  ┌─────────────────────────────────┐  │
│  │  ├───────┤  ├────────┤  │  │     │  │   Chatbot Service (FastAPI)     │  │
│  │  │Medical│  │ Chat   │  │  │     │  │  ┌─────────────┐  ┌──────────┐  │  │
│  │  │Records│  │Messages│  │  │     │  │  │ Patient Bot │  │Doctor Bot│  │  │
│  │  └───────┘  └────────┘  │  │     │  │  └─────────────┘  └──────────┘  │  │
│  └─────────────────────────┘  │     │  └─────────────────────────────────┘  │
└───────────────────────────────┘     └───────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
MedReserve/
├── 📂 backend/                          # Spring Boot Backend
│   ├── 📂 src/
│   │   ├── 📂 main/
│   │   │   ├── 📂 java/com/medreserve/
│   │   │   │   ├── 📂 config/           # App configurations
│   │   │   │   ├── 📂 controller/       # REST API endpoints
│   │   │   │   ├── 📂 dto/              # Data Transfer Objects
│   │   │   │   ├── 📂 entity/           # JPA Entities
│   │   │   │   ├── 📂 repository/       # Data repositories
│   │   │   │   ├── 📂 security/         # JWT & Auth filters
│   │   │   │   ├── 📂 service/          # Business logic
│   │   │   │   └── 📄 MedReserveApplication.java
│   │   │   └── 📂 resources/
│   │   │       ├── 📄 application.yml
│   │   │       └── 📄 application-prod.yml
│   │   └── 📂 test/                     # Unit & integration tests
│   ├── 📂 ml/                           # ML Microservice
│   │   ├── 📂 api/                      # FastAPI endpoints
│   │   ├── 📂 models/                   # Trained ML models
│   │   ├── 📂 train/                    # Training scripts
│   │   ├── 📂 nlp/                      # NLP pipeline
│   │   ├── 📂 utils/                    # Helper utilities
│   │   ├── 📄 requirements.txt
│   │   └── 📄 start.py
│   ├── 📂 chatbot/                      # Chatbot Microservice
│   │   ├── 📄 main.py                   # FastAPI entry point
│   │   ├── 📄 patient_chatbot.py        # Patient chat logic
│   │   ├── 📄 doctor_chatbot.py         # Doctor chat logic
│   │   ├── 📄 config.py                 # Configuration
│   │   └── 📄 requirements.txt
│   ├── 📄 pom.xml                       # Maven configuration
│   ├── 📄 Dockerfile
│   └── 📄 render.yaml                   # Render deployment
│
├── 📂 frontend/                         # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/               # Reusable UI components
│   │   ├── 📂 pages/                    # Route pages
│   │   ├── 📂 services/                 # API service layer
│   │   ├── 📂 contexts/                 # React Context providers
│   │   ├── 📂 hooks/                    # Custom React hooks
│   │   ├── 📂 utils/                    # Utility functions
│   │   ├── 📄 App.jsx
│   │   └── 📄 main.jsx
│   ├── 📂 public/                       # Static assets
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   └── 📄 vercel.json
│
├── 📂 screenshots/                      # Documentation images
├── 📄 README.md                         # This file
└── 📄 .gitignore
```

---

## 🚀 Installation

### Prerequisites

- **Java 17+** ([Download](https://adoptium.net/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Python 3.10+** ([Download](https://www.python.org/))
- **Maven 3.6+** ([Download](https://maven.apache.org/))
- **PostgreSQL 15+** (or use H2 for development)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/rishith2903/MedReserve.git
cd MedReserve
```

### 2️⃣ Backend Setup (Spring Boot)

```bash
# Navigate to backend
cd backend

# Install dependencies and build
mvn clean install -DskipTests

# Run the application
mvn spring-boot:run
```

Backend will start at: `http://localhost:8080`

### 3️⃣ Frontend Setup (React + Vite)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start at: `http://localhost:5173`

### 4️⃣ ML Service Setup (Python FastAPI)

```bash
# Navigate to ML service
cd backend/ml

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start ML service
python start.py
```

ML Service will start at: `http://localhost:8001`

### 5️⃣ Chatbot Service Setup

```bash
# Navigate to chatbot service
cd backend/chatbot

# Install dependencies
pip install -r requirements.txt

# Start chatbot service
python main.py
```

Chatbot Service will start at: `http://localhost:5005`

### 🐳 Docker Setup (Alternative)

```bash
# Build and run all services
docker-compose up --build

# Or run individual services
docker build -t medreserve-backend ./backend
docker run -p 8080:8080 medreserve-backend
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Server Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# Database (PostgreSQL)
DB_URL=jdbc:postgresql://localhost:5432/medreserve_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Security
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# AI Services URLs
ML_SERVICE_URL=http://localhost:8001
CHATBOT_SERVICE_URL=http://localhost:5005

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ML_SERVICE_URL=http://localhost:8001
VITE_CHATBOT_SERVICE_URL=http://localhost:5005
VITE_APP_NAME=MedReserve AI
VITE_APP_VERSION=1.0.0
```

### ML Service (`backend/ml/.env`)

```env
HOST=0.0.0.0
PORT=8001
BACKEND_URL=http://localhost:8080
DEBUG=true
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "role": "PATIENT",
  "phoneNumber": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "uuid-here",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "PATIENT"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid-here",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "PATIENT"
  }
}
```

### ML Prediction Endpoints

#### Symptom to Specialization
```http
POST /api/ml/predict-specialization
Authorization: Bearer <token>
Content-Type: application/json

{
  "symptoms": "chest pain, shortness of breath, fatigue"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "predictions": [
    {
      "specialization": "Cardiology",
      "confidence": 0.87
    },
    {
      "specialization": "Pulmonology",
      "confidence": 0.65
    },
    {
      "specialization": "General Medicine",
      "confidence": 0.42
    }
  ],
  "recommendedDoctors": [...]
}
```

### Appointment Endpoints

#### Book Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor-uuid",
  "appointmentDate": "2024-12-15",
  "appointmentTime": "10:30",
  "reason": "Regular checkup",
  "symptoms": "Mild headache"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointmentId": "apt-uuid",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-12-15",
    "appointmentTime": "10:30",
    "status": "SCHEDULED"
  }
}
```

> 📖 **Full API Documentation:** Available at `/api/swagger-ui.html` when backend is running.

---

## 📊 Dataset Details

### Data Sources

| Dataset | Source | Records | Purpose |
|---------|--------|---------|---------|
| Disease-Symptom Dataset | Custom Curated | ~500 | Symptom-Disease mapping |
| Doctor Specialty Dataset | Custom Curated | ~200 | Disease-to-Specialist mapping |
| Symptom2Disease | Kaggle (Augmented) | ~1,000 | Additional training data |
| Medical Dialogue Dataset | Research Paper | ~500 | Chatbot training |

### Key Features

- **Symptom Columns**: Free-text symptom descriptions
- **Disease Column**: Diagnosed condition/disease
- **Specialization Column**: Recommended medical specialty
- **Medicine Column**: Common treatment medications

### Preprocessing Pipeline

1. **Text Normalization**: Lowercasing, punctuation removal
2. **Medical Tokenization**: Domain-specific tokenization using NLTK
3. **Stop Word Removal**: Filtered medical stop words
4. **TF-IDF Vectorization**: Max 3,000 features with n-gram range (1,2)
5. **Label Encoding**: Categorical encoding for specializations/diseases

---

## 🧠 Model Details

### Symptom → Specialization Model

| Property | Value |
|----------|-------|
| **Algorithm** | Random Forest Classifier |
| **Vectorization** | TF-IDF (max_features=3000) |
| **Hyperparameter Tuning** | GridSearchCV (3-fold CV) |
| **Training Split** | 80% Train / 20% Test |
| **Class Balancing** | Balanced class weights |

#### Model Parameters
```python
RandomForestClassifier(
    n_estimators=100-300,
    max_depth=10-20,
    min_samples_split=2-10,
    min_samples_leaf=1-4,
    class_weight='balanced'
)
```

#### Performance Metrics

| Metric | Score |
|--------|-------|
| **Accuracy** | ~85-92% |
| **Macro F1-Score** | ~0.83 |
| **Precision** | ~0.84 |
| **Recall** | ~0.82 |

### Disease Prediction Model

| Property | Value |
|----------|-------|
| **Algorithm** | Random Forest + Multi-Output |
| **Features** | TF-IDF Symptom Vectors |
| **Output** | Disease + Medicine Predictions |

#### Training Performance
- Disease Accuracy: ~80-85%
- Medicine Accuracy: ~75-80%
- Training Time: ~30-60 seconds (CPU)

<table>
  <tr>
    <td align="center" width="50%">
      <img src="./screenshots/confusion-matrix.png" alt="Confusion Matrix" />
      <br /><strong>Confusion Matrix</strong>
    </td>
    <td align="center" width="50%">
      <img src="./screenshots/feature-importance.png" alt="Feature Importance" />
      <br /><strong>Top Feature Importance</strong>
    </td>
  </tr>
</table>

---

## 💡 Challenges & Learnings

### Technical Challenges

1. **Circular Dependency in Spring Security**: Encountered circular bean dependency between `JwtAuthenticationFilter` and `SecurityConfig`. Resolved by using `@Lazy` injection and restructuring the security configuration hierarchy.

2. **Cross-Origin Resource Sharing (CORS)**: Managing CORS between React frontend (Vercel) and Spring Boot backend (Render) with JWT authentication required careful configuration of allowed origins, headers, and credentials handling.

3. **ML Model Deployment**: Deploying Python ML services alongside Java backend on Render required separate service configurations, proper inter-service communication, and handling cold start latency.

4. **Real-time Chat Synchronization**: Implementing WebSocket-based real-time chat between patients and doctors while maintaining message persistence and handling connection drops gracefully.

5. **Medical Data Imbalance**: Training ML models on imbalanced medical specialty classes required balanced class weights and stratified sampling to prevent bias toward common conditions.

### Key Learnings

- **Microservices Communication**: Gained experience in designing resilient inter-service communication with retry mechanisms and circuit breakers using Resilience4j.
- **Healthcare Domain Knowledge**: Developed understanding of medical terminology, doctor specializations, and healthcare workflow requirements.
- **Production Deployment**: Learned end-to-end deployment strategies for full-stack + ML applications across multiple cloud platforms.

---

## 🚀 Future Improvements

1. **Telemedicine Integration**: Add video consultation capabilities using WebRTC for real-time doctor-patient video calls.

2. **Advanced NLP Chatbot**: Upgrade chatbot to use transformer-based models (BERT/GPT) for more accurate medical dialogue understanding.

3. **Mobile Application**: Develop React Native mobile apps for iOS and Android with push notifications for appointments.

4. **Lab Integration**: Connect with diagnostic labs for automated test result uploads and report generation.

5. **Multi-language Support**: Add internationalization (i18n) for Hindi, Spanish, and other regional languages to broaden accessibility.

6. **Insurance Integration**: Partner with health insurance providers for seamless claim processing and coverage verification.

7. **IoT Health Devices**: Integrate with wearables (smartwatches, BP monitors) for real-time health data synchronization.

---

## 👨‍💻 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/rishith2903">
        <img src="https://github.com/rishith2903.png" width="100px;" alt="Rishith Kumar Pachipulusu" style="border-radius:50%"/>
        <br />
        <sub><b>Rishith Kumar Pachipulusu</b></sub>
      </a>
      <br />
      <a href="https://github.com/rishith2903" title="GitHub">
        <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" />
      </a>
      <a href="https://www.linkedin.com/in/rishith-kumar-pachipulusu-2748b4380/" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" />
      </a>
      <br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>⭐ If you found this project useful, please consider giving it a star!</strong>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/rishith2903">Rishith Kumar Pachipulusu</a>
</p>
