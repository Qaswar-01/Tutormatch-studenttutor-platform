import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, CheckCircle, Clock, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);
      // Reset rate limiting on successful login
      setRateLimited(false);
      setRetryAfter(0);
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (err) {
      // Handle rate limiting
      if (err.response?.status === 429) {
        setRateLimited(true);
        const retryAfterSeconds = parseInt(err.response.headers['retry-after']) || 60;
        setRetryAfter(retryAfterSeconds);

        // Start countdown
        const countdown = setInterval(() => {
          setRetryAfter(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              setRateLimited(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      // Error is handled by the auth context and displayed via toast
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <GraduationCap className="logo-icon" />
              <span className="logo-text">TutorMatch</span>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to your account to continue learning
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox" />
                <span className="checkbox-text">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {rateLimited && (
              <div className="rate-limit-warning">
                <span className="warning-icon">⚠️</span>
                <div className="warning-content">
                  <p><strong>Too many login attempts</strong></p>
                  <p>Please wait {retryAfter} seconds before trying again.</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isLoading || rateLimited}
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" text="" />
              ) : rateLimited ? (
                `Wait ${retryAfter}s`
              ) : (
                'Sign In'
              )}
            </button>
          </form>



          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-image">
          <div className="auth-image-content">
            <h2>Connect with Expert Tutors</h2>
            <p>
              Join thousands of students who have improved their grades and
              achieved their academic goals with personalized tutoring.
            </p>
            <div className="auth-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <CheckCircle size={28} />
                </div>
                <span>Verified tutors</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Clock size={28} />
                </div>
                <span>Flexible scheduling</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Video size={28} />
                </div>
                <span>Real-time chat & video</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
