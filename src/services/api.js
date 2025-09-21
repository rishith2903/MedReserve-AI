/* eslint-disable no-console */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 API Request to ${config.url} with token:`, token.substring(0, 20) + '...');
    } else {
      console.log(`🚫 API Request to ${config.url} without token`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend may be sleeping or unreachable');
      error.message = 'Connection timeout. The server may be starting up, please try again in a moment.';
    } else if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      console.error('401 Unauthorized - token may be expired or invalid');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('403 Forbidden - insufficient permissions:', error.response?.data);
      console.error('Current token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      console.error('Current user:', localStorage.getItem('user'));
    } else if (error.response?.status === 0 || error.message.includes('CORS')) {
      console.error('CORS error - frontend domain not allowed by backend');
      error.message = 'Connection error. Please check your network connection.';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Doctors API
export const doctorsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  getBySpecialty: async (specialty) => {
    const response = await api.get(`/doctors/specialty/${specialty}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/doctors/${doctorId}/available-slots`, {
      params: { date }
    });
    return response.data;
  },

  register: async (doctorData) => {
    const response = await api.post('/doctors/register', doctorData);
    return response.data;
  }
};

// Appointments API
export const appointmentsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/appointments/patient/my-appointments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  update: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  reschedule: async (id, newDateTime) => {
    const response = await api.put(`/appointments/${id}/reschedule`, { newDateTime });
    return response.data;
  },

  book: async (appointmentData) => {
    const response = await api.post('/appointments/book', appointmentData);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/appointments/doctor/${doctorId}/available-slots`, {
      params: { date }
    });
    return response.data;
  },

  // Removed duplicate cancel method - using the one with reason parameter above
};

// Medical Reports API
export const medicalReportsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/medical-reports', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/medical-reports/${id}`);
    return response.data;
  },

  upload: async (formData) => {
    const response = await api.post('/medical-reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/medical-reports/${id}`);
    return response.data;
  }
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/prescriptions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  create: async (prescriptionData) => {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data;
  }
};



// AI Services API
export const aiAPI = {
  analyzeSymptoms: async (symptoms) => {
    const response = await api.post('/ai/analyze-symptoms', { symptoms });
    return response.data;
  },

  chatbot: async (message) => {
    const response = await api.post('/ai/chatbot', { message });
    return response.data;
  }
};

// Disease Prediction API
export const diseasePredictionAPI = {
  predict: async (symptoms, method = 'ensemble', additionalData = {}) => {
    const response = await api.post('/disease-prediction/predict', {
      symptoms,
      method,
      ...additionalData
    });
    return response.data;
  },

  predictML: async (symptoms, additionalData = {}) => {
    const response = await api.post('/disease-prediction/predict/ml', {
      symptoms,
      ...additionalData
    });
    return response.data;
  },

  predictDL: async (symptoms, additionalData = {}) => {
    const response = await api.post('/disease-prediction/predict/dl', {
      symptoms,
      ...additionalData
    });
    return response.data;
  },

  compare: async (symptoms, additionalData = {}) => {
    const response = await api.post('/disease-prediction/compare', {
      symptoms,
      ...additionalData
    });
    return response.data;
  },

  analyze: async (symptoms, analysisType = 'ml', topFeatures = 10) => {
    const response = await api.post('/disease-prediction/analyze', {
      symptoms,
      analysisType,
      topFeatures
    });
    return response.data;
  },

  healthCheck: async () => {
    const response = await api.get('/disease-prediction/health');
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getAllDoctors: async (params = {}) => {
    const response = await api.get('/admin/doctors', { params });
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await api.get('/admin/system-health');
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  }
};

// Health API
export const healthAPI = {
  check: async () => {
    const response = await api.get('/actuator/health');
    return response.data;
  },

  test: async () => {
    const response = await api.get('/test');
    return response.data;
  }
};

// Health Tips API
export const healthTipsAPI = {
  getAll: async () => {
    const response = await api.get('/health-tips');
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await api.get(`/health-tips/category/${category}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/health-tips/${id}`);
    return response.data;
  }
};

export default api;
