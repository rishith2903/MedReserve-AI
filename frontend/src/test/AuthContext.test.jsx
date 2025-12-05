import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

// Mock the API module to provide authAPI used by AuthContext
vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, login, logout, signup, isLoading } = useAuth();
  const [error, setError] = useState(null);
  
  const handleLogin = async () => {
    setError(null);
    try {
      await login({ email: 'test@example.com', password: 'password123' });
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Unknown error');
    }
  };

  const handleSignup = async () => {
    setError(null);
    try {
      await signup({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Unknown error');
    }
  };
  
  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <div data-testid="loading-status">
        {isLoading ? 'Loading...' : 'Not loading'}
      </div>
      <div data-testid="error-status">
        {error || 'No error'}
      </div>
      <button 
        data-testid="login-btn" 
        onClick={handleLogin}
      >
        Login
      </button>
      <button 
        data-testid="signup-btn" 
        onClick={handleSignup}
      >
        Signup
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const renderWithAuthProvider = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial auth state', () => {
    renderWithAuthProvider(<TestComponent />);
    
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error-status')).toHaveTextContent('No error');
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'PATIENT',
    };

    api.authAPI.login.mockResolvedValueOnce(mockResponse);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('login-btn'));
    
    // Should show loading state
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading...');
    
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    });

    // Check localStorage
    expect(localStorage.getItem('authToken')).toBe('mock-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'PATIENT' }));
  });

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials');
    api.authAPI.login.mockRejectedValueOnce(mockError);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('login-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });
  });

  it('should handle successful signup', async () => {
    const mockResponse = { success: true, message: 'User registered successfully!' };

    api.authAPI.signup.mockResolvedValueOnce(mockResponse);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('signup-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('error-status')).toHaveTextContent('No error');
    });

    expect(api.authAPI.signup).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
  });

  it('should handle logout', async () => {
    // Setup initial logged in state
    localStorage.setItem('authToken', 'mock-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    }));

    api.authAPI.logout.mockResolvedValueOnce({});

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('logout-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    // Check localStorage is cleared
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(api.authAPI.logout).toHaveBeenCalled();
  });

  it('should restore user from localStorage on mount', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };

    localStorage.setItem('authToken', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithAuthProvider(<TestComponent />);
    
    expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
  });

  it('should handle API errors gracefully', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Server error'
        }
      }
    };

    api.authAPI.login.mockRejectedValueOnce(mockError);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('login-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('Server error');
    });
  });

  it('should clear error on successful operation', async () => {
    // First, cause an error
    api.authAPI.login.mockRejectedValueOnce(new Error('Test error'));
    
    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('login-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('Test error');
    });

    // Then, perform successful operation
    const mockResponse = {
      accessToken: 'mock-token',
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'PATIENT',
    };
    api.authAPI.login.mockResolvedValueOnce(mockResponse);
    
    fireEvent.click(screen.getByTestId('login-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('No error');
    });
  });
});
