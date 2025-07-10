import React, { useState, useEffect } from 'react';
import { validateEmail, validatePhone } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

const BasicInfoForm = ({ profileData, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    phone: '',
    dateOfBirth: '',
    city: '',
    country: ''
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : '',
        city: profileData.city || '',
        country: profileData.country || 'United States'
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setHasChanges(true);
    
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
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio must not exceed 1000 characters';
    }
    
    if (formData.city && formData.city.length > 100) {
      newErrors.city = 'City must not exceed 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onUpdate(formData);
      setHasChanges(false);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleReset = () => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : '',
        city: profileData.city || '',
        country: profileData.country || 'United States'
      });
      setErrors({});
      setHasChanges(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Basic Information</h2>
      
      <div className="form-section">
        <h3>Personal Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name *
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
              Last Name *
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

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
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
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
            {errors.phone && (
              <span className="form-error">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth" className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`form-input ${errors.city ? 'error' : ''}`}
              placeholder="Enter your city"
              disabled={isLoading}
            />
            {errors.city && (
              <span className="form-error">{errors.city}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="country" className="form-label">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="form-select"
              disabled={isLoading}
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Spain">Spain</option>
              <option value="Italy">Italy</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>About You</h3>
        <div className="form-group">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className={`form-textarea ${errors.bio ? 'error' : ''}`}
            placeholder="Tell us about yourself..."
            rows="4"
            disabled={isLoading}
          />
          {errors.bio && (
            <span className="form-error">{errors.bio}</span>
          )}
          <span className="form-help">
            {formData.bio.length}/1000 characters
          </span>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-outline"
          disabled={isLoading || !hasChanges}
        >
          Reset
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? (
            <LoadingSpinner size="small" color="white" text="" />
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default BasicInfoForm;
