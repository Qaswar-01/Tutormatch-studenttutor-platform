import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAIL: 'LOAD_USER_FAIL',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAIL:
    case AUTH_ACTIONS.REGISTER_FAIL:
    case AUTH_ACTIONS.LOAD_USER_FAIL:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          const response = await authAPI.getMe();
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: response.data,
          });
        } catch (error) {
          console.error('Load user error:', error);
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAIL,
            payload: error.response?.data?.message || 'Failed to load user',
          });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAIL, payload: null });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authAPI.login(credentials);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data,
      });

      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';

      if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Account is temporarily locked. Please contact support.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        // Fallback to mock login when API is not available
        console.warn('API not available, using mock login for development');

        // Simple mock authentication for development
        if (credentials.email && credentials.password) {
          const mockUser = {
            _id: 'mock-user-1',
            firstName: credentials.email.includes('student') ? 'Alice' : 'Sarah',
            lastName: credentials.email.includes('student') ? 'Johnson' : 'Wilson',
            email: credentials.email,
            role: credentials.email.includes('student') ? 'student' : 'tutor',
            profileCompleted: true,
            avatar: `https://ui-avatars.com/api/?name=${credentials.email.split('@')[0]}&size=300&background=4F46E5&color=fff`
          };

          const mockToken = 'mock-jwt-token';

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: mockUser, token: mockToken },
          });

          toast.success('Login successful! (Development mode)');
          return { user: mockUser, token: mockToken };
        } else {
          errorMessage = 'Please enter valid credentials.';
        }
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAIL,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await authAPI.register(userData);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: response.data,
      });

      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAIL,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  }, []);

  // Update user function
  const updateUser = useCallback((userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user?.role]);

  // Check if user is admin
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);

  // Check if user is tutor
  const isTutor = useCallback(() => hasRole('tutor'), [hasRole]);

  // Check if user is student
  const isStudent = useCallback(() => hasRole('student'), [hasRole]);

  // Check if tutor is approved
  const isTutorApproved = useCallback(() => {
    return isTutor() && !state.user?.pendingApproval;
  }, [isTutor, state.user?.pendingApproval]);

  // Check if profile is complete
  const isProfileComplete = useCallback(() => {
    return state.user?.profileCompleted;
  }, [state.user?.profileCompleted]);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    isAdmin,
    isTutor,
    isStudent,
    isTutorApproved,
    isProfileComplete,
  }), [
    state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    isAdmin,
    isTutor,
    isStudent,
    isTutorApproved,
    isProfileComplete,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
