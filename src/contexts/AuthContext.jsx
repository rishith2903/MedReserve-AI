/* eslint-disable no-console */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app start
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser && storedUser !== 'undefined') {
          try {
            const userData = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);

            // Store last visited page to prevent unwanted redirects
            const lastPath = localStorage.getItem('lastPath');
            if (lastPath && lastPath !== '/login' && lastPath !== '/signup') {
              // Don't redirect if user was on a specific page
              console.log('User was on:', lastPath);
            }

            // Verify token in background (don't block UI)
            setTimeout(async () => {
              try {
                const response = await authAPI.getCurrentUser();
                const maybeUser = response?.user || response;
                if (maybeUser && (maybeUser.email || maybeUser.id)) {
                  setUser(maybeUser);
                  localStorage.setItem('user', JSON.stringify(maybeUser));
                }
              } catch (error) {
                console.warn('Token verification failed:', error);
                // Don't logout immediately, let user continue
              }
            }, 1000);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);

      // Backend returns: { accessToken, refreshToken, id, email, firstName, lastName, role }
      if (response.accessToken) {
        const token = response.accessToken;
        const user = {
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role
        };

        setToken(token);
        setUser(user);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('refreshToken', response.refreshToken);

        // Debug logging removed to avoid exposing sensitive user details in console
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.signup(userData);

      // For signup, backend returns success message, not tokens
      // User needs to login after successful signup
      if (response.success || response.message) {
        // Signup successful, but don't auto-login
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Call logout API in background
    authAPI.logout().catch(error => {
      console.warn('Logout API call failed:', error);
    });
  };

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
