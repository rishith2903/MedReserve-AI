# 🏥 MedReserve — Frontend (React + Vite)

See overall architecture diagram: [../docs/architecture.mmd](../docs/architecture.mmd)

Modern, responsive UI for patients, doctors, and admins. JavaScript-only (no TypeScript).

## 🚀 Quickstart

Windows (PowerShell)
```
cd frontend
npm install
npm run dev
```

macOS/Linux
```
cd frontend && npm install && npm run dev
```

Local URL: http://localhost:3000

## 🔧 Configuration (.env.local — example)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_ML_SERVICE_URL=http://localhost:5001
VITE_CHATBOT_SERVICE_URL=http://localhost:8001
VITE_APP_NAME=MedReserve AI
VITE_APP_VERSION=1.0.0
```

## 🧪 Testing
```
# Unit tests (Vitest)
npm test

# Coverage
npm run test:coverage

# Playwright E2E
npm run e2e:install
npm run e2e
```

## 🐳 Docker (service-only)
```
docker build -t medreserve-frontend .
docker run -p 3000:80 medreserve-frontend
```

Tip: Prefer running all services together with root docker-compose.

## 🔒 Notes
- JS-only project (.js/.jsx). No TypeScript.
- Use env variables above to point to local or production services.

## 👥 Demo Credentials (for testing only)
- Patient: patient@medreserve.com / password123
- Doctor: doctor@medreserve.com / password123
- Admin: demo@medreserve.com / password123
- Master Admin: admin@medreserve.com / MasterAdmin@123

## 🌐 Production
- Example API base: https://medreserve-ai-backend.onrender.com
- Example ML: https://medreserve-ml.onrender.com
- Example Chatbot: https://medreserve-chatbot.onrender.com

### 🔐 Authentication & Authorization
- **Secure Login/Signup** with JWT token management
- **Role-based Access Control** (Patient, Doctor, Admin, Master Admin)
- **Protected Routes** with automatic redirection
- **Session Management** with token refresh
- **Password Validation** and security requirements

### 👥 User Management
- **Patient Dashboard** with personal health overview
- **Doctor Portal** with patient management tools
- **Admin Panel** for user and system management
- **Profile Management** with photo upload
- **Role-specific Navigation** and features

### 📅 Appointment System
- **Interactive Calendar** for appointment booking
- **Real-time Availability** checking
- **Appointment Management** (book, reschedule, cancel)
- **Doctor Search** by specialty and location
- **Appointment History** and upcoming appointments

### 🏥 Medical Records
- **Electronic Health Records** viewing and management
- **Medical Report Upload** with file management
- **Prescription Tracking** and medication history
- **Document Viewer** for medical files
- **Health Timeline** visualization

### 🤖 AI-Powered Features
- **Symptom Checker** with ML-powered analysis
- **Healthcare Chatbot** with multilingual support
- **Health Risk Assessment** and recommendations
- **Personalized Health Tips** based on user data
- **Smart Appointment Suggestions**

### 📊 Analytics & Reporting
- **Interactive Dashboards** with real-time data
- **Health Metrics Visualization** with charts
- **Appointment Analytics** and trends
- **User Activity Reports**
- **System Performance Monitoring**

### 🎨 User Experience
- **Responsive Design** for all devices
- **Dark/Light Theme** support
- **Accessibility Features** (WCAG compliant)
- **Multilingual Support** (English, Hindi, Telugu)
- **Progressive Web App** capabilities

## 🏗️ Tech Stack

- **Framework**: React 18.2.0 with JavaScript (ES6+)
- **Build Tool**: Vite 5.0.0 for fast development and optimized builds
- **UI Library**: Material-UI (MUI) 5.14.0 for consistent design
- **State Management**: React Query for server state, Context API for global state
- **Routing**: React Router 6.x for client-side navigation
- **Form Handling**: React Hook Form with Yup validation
- **HTTP Client**: Axios for API communication
- **Testing**: Vitest, React Testing Library, Jest
- **Styling**: CSS-in-JS with MUI's styled components
- **Icons**: Material Icons and custom SVG icons
- **Charts**: Recharts for data visualization
- **Date Handling**: Day.js for date manipulation

## 📋 Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 9+** or **yarn 1.22+** for package management
- **Git** for version control
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd MedReserve/frontend
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Configuration
Create environment configuration file:
```bash
# Copy example environment file
cp .env.example .env.local
```

Configure environment variables in `.env.local`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_ML_SERVICE_URL=http://localhost:8001
VITE_CHATBOT_SERVICE_URL=http://localhost:8002

# Application Configuration
VITE_APP_NAME=MedReserve AI
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_ML_FEATURES=true
VITE_ENABLE_ANALYTICS=true

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_CONFIG=your_firebase_config

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
# API Timeouts
VITE_API_TIMEOUT=30000
# Auto logout inactivity timeout (ms)
VITE_INACTIVITY_TIMEOUT_MS=300000
```
```

### 4. Start Development Server
```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

The application will be available at `http://localhost:3000`

### 5. Smoke test signup/login (optional)
```bash
# Backend must be running on http://localhost:8080
npm run smoke:auth
# Or specify a custom base:
API_BASE_URL=http://localhost:8080 npm run smoke:auth
```

### 6. Build for Production
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run analyze
```

### 🔐 Sessions and Security

- Automatic token refresh: If the access token expires, the client will transparently refresh it using the stored refresh token and retry the request.
- Session expiry handling: If refresh fails, credentials are cleared, and a clear message is shown on the login page.
- Inactivity auto-logout: After 5 minutes of inactivity, the user is logged out and redirected to login with an explanatory message.

### 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- AuthContext.test.jsx
```

### Component Testing
```bash
# Test specific component
npm test -- --testNamePattern="Login Component"

# Test with UI mode
npm run test:ui

# Update snapshots
npm run test:update-snapshots
```

### E2E Testing
```bash
# Install Playwright browsers (first time)
npm run e2e:install

# Run E2E tests (frontend dev server and backend must be running)
npm run e2e

# Run E2E in headed mode
npm run e2e:headed

# Open Playwright UI mode
npm run e2e:ui
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
# Build development image
docker build -f Dockerfile.dev -t medreserve-frontend:dev .

# Build production image
docker build -t medreserve-frontend:prod .
```

### Run with Docker
```bash
# Run development container
docker run -d \
  --name medreserve-frontend-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  medreserve-frontend:dev

# Run production container
docker run -d \
  --name medreserve-frontend-prod \
  -p 80:80 \
  medreserve-frontend:prod
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8080
    depends_on:
      - backend
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## 🚀 Production Deployment

### GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Deploy to GitHub Pages
npm run deploy

# Custom domain setup
echo "your-domain.com" > public/CNAME
```

### Netlify
```bash
# Build command: npm run build
# Publish directory: dist
# Environment variables: Set in Netlify dashboard

# Deploy with Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure in vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ]
}
```

### AWS S3 + CloudFront
```bash
# Build for production
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 📁 Project Structure

See also: Routing and role protection docs in `docs/ROUTING.md`.

```
frontend/
├── public/                          # Static assets
│   ├── index.html                   # HTML template
│   ├── favicon.ico                  # App favicon
│   ├── manifest.json               # PWA manifest
│   └── robots.txt                  # SEO robots file
├── src/
│   ├── components/                  # Reusable components
│   │   ├── Auth/                   # Authentication components
│   │   ├── Common/                 # Common UI components
│   │   ├── Dashboard/              # Dashboard components
│   │   ├── Forms/                  # Form components
│   │   └── Layout/                 # Layout components
│   ├── pages/                      # Page components
│   │   ├── Auth/                   # Login, Signup pages
│   │   ├── Dashboard/              # Dashboard pages
│   │   ├── Appointments/           # Appointment pages
│   │   ├── Doctors/                # Doctor pages
│   │   ├── Profile/                # Profile pages
│   │   └── AI/                     # AI feature pages
│   ├── contexts/                   # React contexts
│   │   ├── AuthContext.jsx         # Authentication context
│   │   ├── ThemeContext.jsx        # Theme context
│   │   └── NotificationContext.jsx # Notification context
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.js              # Authentication hook
│   │   ├── useApi.js               # API hook
│   │   └── useLocalStorage.js      # Local storage hook
│   ├── services/                   # API services
│   │   ├── api.js                  # Main API client
│   │   ├── authService.js          # Authentication service
│   │   ├── appointmentService.js   # Appointment service
│   │   └── userService.js          # User service
│   ├── utils/                      # Utility functions
│   │   ├── constants.js            # App constants
│   │   ├── helpers.js              # Helper functions
│   │   ├── validation.js           # Validation schemas
│   │   └── formatters.js           # Data formatters
│   ├── styles/                     # Global styles
│   │   ├── globals.css             # Global CSS
│   │   ├── theme.js                # MUI theme configuration
│   │   └── variables.css           # CSS variables
│   ├── assets/                     # Static assets
│   │   ├── images/                 # Image files
│   │   ├── icons/                  # Icon files
│   │   └── fonts/                  # Font files
│   ├── App.jsx                     # Main App component
│   ├── main.jsx                    # Application entry point
│   └── vite-env.d.ts              # Vite environment types
├── tests/                          # Test files
│   ├── __mocks__/                  # Test mocks
│   ├── components/                 # Component tests
│   ├── pages/                      # Page tests
│   ├── services/                   # Service tests
│   └── utils/                      # Utility tests
├── .env.example                    # Environment variables example
├── .gitignore                      # Git ignore rules
├── Dockerfile                      # Docker configuration
├── nginx.conf                      # Nginx configuration
├── package.json                    # NPM configuration
├── vite.config.js                  # Vite configuration
├── vitest.config.js               # Vitest configuration
└── README.md                      # This file
```

## 🔗 API Integration

### Authentication API
```javascript
// Login example
import { authService } from './services/authService';

const handleLogin = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    // Handle successful login
    setUser(response.user);
    setToken(response.token);
  } catch (error) {
    // Handle login error
    console.error('Login failed:', error);
  }
};
```

### Protected API Calls
```javascript
// API service with authentication
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      await refreshToken();
    }
    return Promise.reject(error);
  }
);
```

## 🎨 Theming and Styling

### Material-UI Theme Configuration
```javascript
// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});
```

### Custom CSS Variables
```css
/* src/styles/variables.css */
:root {
  --primary-color: #1976d2;
  --secondary-color: #dc004e;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --info-color: #2196f3;

  --text-primary: #212121;
  --text-secondary: #757575;
  --text-disabled: #bdbdbd;

  --background-default: #fafafa;
  --background-paper: #ffffff;
  --background-level1: #f5f5f5;
  --background-level2: #eeeeee;

  --border-color: #e0e0e0;
  --divider-color: #e0e0e0;

  --shadow-1: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-2: 0 1px 5px rgba(0,0,0,0.2);
  --shadow-3: 0 1px 8px rgba(0,0,0,0.3);

  --border-radius: 8px;
  --border-radius-small: 4px;
  --border-radius-large: 12px;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

## 🔐 Demo Credentials

The application includes demo accounts for testing different user roles:

### Patient Account
- **Email**: `patient@medreserve.com`
- **Password**: `password123`
- **Features**: Book appointments, view medical records, use AI features

### Doctor Account
- **Email**: `doctor@medreserve.com`
- **Password**: `password123`
- **Features**: Manage appointments, view patient records, update availability

### Admin Account
- **Email**: `demo@medreserve.com`
- **Password**: `password123`
- **Features**: User management, system analytics, admin dashboard

### Master Admin Account
- **Email**: `admin@medreserve.com`
- **Password**: `MasterAdmin@123`
- **Features**: Full system access, configuration management

## 🛠️ Development Guide

### Adding New Components
```javascript
// Create component file: src/components/MyComponent/MyComponent.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const MyComponent = ({ title, children, ...props }) => {
  return (
    <Box {...props}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {children}
    </Box>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default MyComponent;
```

### Creating Custom Hooks
```javascript
// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
```

### Form Validation with Yup

Validation rules used in the app:
- Phone: Indian format only — must start with +91 followed by 10 digits (first digit 6–9). Example: +919876543210
- Password: must be 8+ chars with uppercase, lowercase, digit, and one of @$!%*?&.

```javascript
// src/utils/validation.js
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const signupSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});
```
