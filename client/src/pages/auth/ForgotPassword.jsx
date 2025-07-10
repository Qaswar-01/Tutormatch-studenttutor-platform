import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await authAPI.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <span className="logo-icon">📧</span>
                <span className="logo-text">Check Your Email</span>
              </div>
              <h1 className="auth-title">Reset Link Sent</h1>
              <p className="auth-subtitle">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>

            <div className="auth-form">
              <div className="success-message">
                <p>
                  Please check your email and click the reset link to create a new password.
                  If you don't see the email, check your spam folder.
                </p>
              </div>

              <Link to="/login" className="btn btn-primary btn-lg">
                Back to Login
              </Link>
            </div>

            <div className="auth-footer">
              <p>
                Didn't receive the email?{' '}
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="auth-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🔒</span>
              <span className="logo-text">Reset Password</span>
            </div>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">
              Enter your email address and we'll send you instructions to reset your password
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="Enter your email address"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <span className="form-error">{error}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" text="" />
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .success-message {
          background-color: var(--success-50, #f0fdf4);
          border: 1px solid var(--success-200, #bbf7d0);
          border-radius: var(--radius-md);
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .success-message p {
          color: var(--success-700, #15803d);
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
