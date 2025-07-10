import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Search, Calendar, MessageCircle, DollarSign, Clock, Star, UserCheck, BookOpen, CheckCircle, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (err) {
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
              <GraduationCap size={24} className="logo-icon" />
              <span className="logo-text">TutorMatch</span>
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join our community of learners and educators
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">I want to</label>
              <div className="role-selection">
                <label className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="role-radio"
                  />
                  <div className="role-content">
                    <BookOpen size={20} className="role-icon" />
                    <span className="role-title">Learn</span>
                    <span className="role-desc">Find tutors and book sessions</span>
                  </div>
                </label>
                <label className={`role-option ${formData.role === 'tutor' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="tutor"
                    checked={formData.role === 'tutor'}
                    onChange={handleChange}
                    className="role-radio"
                  />
                  <div className="role-content">
                    <UserCheck size={20} className="role-icon" />
                    <span className="role-title">Teach</span>
                    <span className="role-desc">Share knowledge and earn money</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* Email */}
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

            {/* Password Fields */}
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
                placeholder="Create a password"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
              <span className="form-help">
                Must contain at least 6 characters with uppercase, lowercase, and number
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Terms */}
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox" required />
                <span className="checkbox-text">
                  I agree to the{' '}
                  <Link to="/terms" className="auth-link">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" text="" />
              ) : (
                `Create ${formData.role === 'student' ? 'Student' : 'Tutor'} Account`
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-image">
          <div className="auth-image-content">
            <h2>
              {formData.role === 'student'
                ? 'Start Your Learning Journey'
                : 'Share Your Expertise'
              }
            </h2>
            <p>
              {formData.role === 'student'
                ? 'Get personalized tutoring from qualified experts and achieve your academic goals.'
                : 'Help students succeed while earning money teaching subjects you love.'
              }
            </p>
            <div className="auth-features">
              {formData.role === 'student' ? (
                <>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <CheckCircle size={28} />
                    </div>
                    <span>Find perfect tutors</span>
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
                    <span>Interactive sessions</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <DollarSign size={28} />
                    </div>
                    <span>Earn money teaching</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Clock size={28} />
                    </div>
                    <span>Set your own schedule</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Star size={28} />
                    </div>
                    <span>Build your reputation</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
