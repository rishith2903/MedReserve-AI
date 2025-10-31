/* eslint-disable no-console */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const RAW_TIMEOUT = import.meta.env.VITE_API_TIMEOUT;
const API_TIMEOUT = Number.isFinite(Number(RAW_TIMEOUT)) ? Number(RAW_TIMEOUT) : 30000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const url = config?.url || '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      const short = `${token}...`;
      console.log(`🔐 API Request to ${url} with token:`, short);
    } else {
      console.log(`🚫 API Request to ${url} without token`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh state and helpers
let isRefreshing = false;
let refreshSubscribers = [];
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};
const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

// Use a bare axios call (no interceptors) to avoid loops when refreshing
const refreshAccessToken = async () => {
  const rt = localStorage.getItem('refreshToken');
  if (!rt) throw new Error('Missing refresh token');
  const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, null, { params: { refreshToken: rt } });
  return resp.data;
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend may be sleeping or unreachable');
      error.message = 'Connection timeout. The server may be starting up, please try again in a moment.';
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // Attempt token refresh on 401 once
    if (status === 401 && !originalRequest._retry) {
      const hasRefresh = !!localStorage.getItem('refreshToken');
      if (!hasRefresh) {
        // No refresh token available, clear and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.setItem('sessionMsg', 'Your session expired. Please sign in again.');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const data = await refreshAccessToken();
        const newToken = data?.accessToken;
        if (!newToken) throw new Error('Invalid refresh response');
        // Persist tokens
        localStorage.setItem('authToken', newToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        // Notify waiters
        onRefreshed(newToken);
        isRefreshing = false;
        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        // Refresh failed - clear and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.setItem('sessionMsg', 'Your session expired. Please sign in again.');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

  if (status === 403) {
      // Forbidden - insufficient permissions
      const detail = error.response?.data?.message ?? error.response?.data ?? 'Forbidden';
      console.error('403 Forbidden - insufficient permissions:', detail);
    } else if (status === 0 || error.message?.includes('CORS')) {
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
    const response = await api.post('/auth/signout');
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', null, { params: { refreshToken } });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
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
    const response = await api.put(`/appointments/${id}/cancel`, null, {
      params: { reason }
    });
    return response.data;
  },

  reschedule: async (id, newDateTime) => {
    // Format to 'yyyy-MM-dd HH:mm' to satisfy backend @DateTimeFormat
    const d = new Date(newDateTime);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    const response = await api.put(`/appointments/${id}/reschedule`, null, {
      params: { newDateTime: formatted }
    });
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
    // Backend endpoint returns a Page<MedicalReportResponse>
    const response = await api.get('/medical-reports/my-reports', { params });
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

  download: async (id) => {
    const response = await api.get(`/medical-reports/${id}/download`, {
      responseType: 'blob'
    });
    // Try to extract filename from Content-Disposition
    let filename = 'report';
    const dispo = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    if (dispo) {
      const match = /filename="?([^";]+)"?/i.exec(dispo);
      if (match && match[1]) filename = match[1];
    }
    return { blob: response.data, filename };
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
  },

  // Personalized endpoint if backend supports it; fallback to getAll
  getPersonalized: async () => {
    try {
      const response = await api.get('/health-tips/personalized');
      return response.data;
    } catch (_) {
      return await healthTipsAPI.getAll();
    }
  }
};

export default api;
