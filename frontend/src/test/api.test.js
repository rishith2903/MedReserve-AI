import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
let api;

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
const mockLocation = {
  href: ''
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('API Service', () => {
  let mockAxiosInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    await vi.resetModules();

    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    axios.create.mockReturnValue(mockAxiosInstance);

    // Import the API module after setting up axios mock so interceptors attach to this instance
    await import('../services/api');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create axios instance with correct base URL', () => {
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: expect.any(String),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    }));
  });

  it('should add authorization header when token exists', () => {
    localStorageMock.getItem.mockReturnValue('mock-token');
    
    // Simulate request interceptor
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const config = { headers: {} };
    
    const result = requestInterceptor(config);
    
    expect(result.headers.Authorization).toBe('Bearer mock-token');
  });

  it('should not add authorization header when token does not exist', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const config = { headers: {} };
    
    const result = requestInterceptor(config);
    
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should handle successful responses', () => {
    const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
    const response = { data: 'test data' };
    
    const result = responseInterceptor(response);
    
    expect(result).toBe(response);
  });

  it('should handle 401 errors by clearing storage and redirecting', async () => {
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = {
      response: { status: 401 }
    };
    
    await expect(errorHandler(error)).rejects.toBeDefined();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(mockLocation.href).toBe('/login');
  });

  it('should handle 403 errors with proper logging', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = {
      response: { 
        status: 403,
        data: 'Forbidden'
      }
    };
    
    await expect(errorHandler(error)).rejects.toBeDefined();
    
    expect(consoleSpy).toHaveBeenCalledWith('403 Forbidden - insufficient permissions:', 'Forbidden');
    
    consoleSpy.mockRestore();
  });

  it('should handle network/CORS-like errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = {
      response: { status: 0 },
      message: 'Network Error'
    };
    
    await expect(errorHandler(error)).rejects.toBeDefined();
    
    expect(consoleSpy).toHaveBeenCalledWith('CORS error - frontend domain not allowed by backend');
    
    consoleSpy.mockRestore();
  });

  it('should handle CORS errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = {
      message: 'CORS error detected'
    };
    
    await expect(errorHandler(error)).rejects.toBeDefined();
    
    expect(consoleSpy).toHaveBeenCalledWith('CORS error - frontend domain not allowed by backend');
    
    consoleSpy.mockRestore();
  });

  it('should handle timeout errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    const error = {
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded'
    };
    
    await expect(errorHandler(error)).rejects.toBeDefined();
    
    expect(consoleSpy).toHaveBeenCalledWith('Request timeout - backend may be sleeping or unreachable');
    
    consoleSpy.mockRestore();
  });

  it('should log request details when token is present', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValue('mock-token-12345');
    
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const config = { 
      headers: {},
      url: '/test-endpoint'
    };
    
    requestInterceptor(config);
    
    expect(consoleSpy).toHaveBeenCalledWith('🔐 API Request to /test-endpoint with token:', 'mock-token-12345...');
    
    consoleSpy.mockRestore();
  });

  it('should log request details when token is not present', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValue(null);
    
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const config = { 
      headers: {},
      url: '/test-endpoint'
    };
    
    requestInterceptor(config);
    
    expect(consoleSpy).toHaveBeenCalledWith('🚫 API Request to /test-endpoint without token');
    
    consoleSpy.mockRestore();
  });
});
