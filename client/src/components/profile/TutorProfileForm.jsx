import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const TutorProfileForm = ({ profileData, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    subjects: [],
    qualifications: '',
    experience: '',
    hourlyRate: ''
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  // Common subjects for suggestions
  const commonSubjects = [
    'Mathematics', 'Algebra', 'Calculus', 'Statistics', 'Geometry',
    'Physics', 'Chemistry', 'Biology', 'Science',
    'English', 'Literature', 'Writing', 'Grammar',
    'History', 'Geography', 'Social Studies',
    'Computer Science', 'Programming', 'Python', 'JavaScript', 'Java',
    'Spanish', 'French', 'German', 'ESL',
    'SAT Prep', 'ACT Prep', 'Test Preparation',
    'Elementary Math', 'Middle School Math', 'High School Math'
  ];

  useEffect(() => {
    if (profileData) {
      setFormData({
        subjects: profileData.subjects || [],
        qualifications: profileData.qualifications || '',
        experience: profileData.experience?.toString() || '',
        hourlyRate: profileData.hourlyRate?.toString() || ''
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

  const handleAddSubject = () => {
    const subject = newSubject.trim();
    if (subject && !formData.subjects.includes(subject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
      setNewSubject('');
      setHasChanges(true);
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
    }));
    setHasChanges(true);
  };

  const handleSubjectSuggestion = (subject) => {
    if (!formData.subjects.includes(subject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
      setHasChanges(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }
    
    if (!formData.qualifications.trim()) {
      newErrors.qualifications = 'Qualifications are required';
    } else if (formData.qualifications.length > 1000) {
      newErrors.qualifications = 'Qualifications must not exceed 1000 characters';
    }
    
    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    } else {
      const exp = parseInt(formData.experience);
      if (isNaN(exp) || exp < 0 || exp > 50) {
        newErrors.experience = 'Experience must be between 0 and 50 years';
      }
    }
    
    if (!formData.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else {
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 5 || rate > 500) {
        newErrors.hourlyRate = 'Hourly rate must be between $5 and $500';
      }
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
      const updateData = {
        ...formData,
        experience: parseInt(formData.experience),
        hourlyRate: parseFloat(formData.hourlyRate)
      };
      await onUpdate(updateData);
      setHasChanges(false);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleReset = () => {
    if (profileData) {
      setFormData({
        subjects: profileData.subjects || [],
        qualifications: profileData.qualifications || '',
        experience: profileData.experience?.toString() || '',
        hourlyRate: profileData.hourlyRate?.toString() || ''
      });
      setErrors({});
      setHasChanges(false);
    }
  };

  const availableSubjects = commonSubjects.filter(
    subject => !formData.subjects.includes(subject) && 
    subject.toLowerCase().includes(newSubject.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Tutor Information</h2>
      
      <div className="form-section">
        <h3>Teaching Subjects</h3>
        <div className="form-group">
          <label className="form-label">
            Subjects You Teach *
          </label>
          
          {/* Current subjects */}
          <div className="subjects-input">
            {formData.subjects.map((subject, index) => (
              <div key={index} className="subject-tag">
                <span>{subject}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(subject)}
                  className="subject-remove"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {/* Add new subject */}
          <div className="add-subject">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add a subject..."
              className="form-input"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubject();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSubject}
              className="btn btn-outline btn-sm"
              disabled={isLoading || !newSubject.trim()}
            >
              Add
            </button>
          </div>
          
          {/* Subject suggestions */}
          {newSubject && availableSubjects.length > 0 && (
            <div className="subject-suggestions">
              <p className="suggestions-label">Suggestions:</p>
              <div className="suggestions-list">
                {availableSubjects.slice(0, 5).map((subject, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSubjectSuggestion(subject)}
                    className="suggestion-btn"
                    disabled={isLoading}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {errors.subjects && (
            <span className="form-error">{errors.subjects}</span>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>Professional Background</h3>
        <div className="form-group">
          <label htmlFor="qualifications" className="form-label">
            Qualifications & Education *
          </label>
          <textarea
            id="qualifications"
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            className={`form-textarea ${errors.qualifications ? 'error' : ''}`}
            placeholder="Describe your education, certifications, and relevant qualifications..."
            rows="4"
            disabled={isLoading}
          />
          {errors.qualifications && (
            <span className="form-error">{errors.qualifications}</span>
          )}
          <span className="form-help">
            {formData.qualifications.length}/1000 characters
          </span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="experience" className="form-label">
              Years of Experience *
            </label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className={`form-input ${errors.experience ? 'error' : ''}`}
              placeholder="0"
              min="0"
              max="50"
              disabled={isLoading}
            />
            {errors.experience && (
              <span className="form-error">{errors.experience}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="hourlyRate" className="form-label">
              Hourly Rate (USD) *
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className={`form-input ${errors.hourlyRate ? 'error' : ''}`}
                placeholder="25"
                min="5"
                max="500"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            {errors.hourlyRate && (
              <span className="form-error">{errors.hourlyRate}</span>
            )}
            <span className="form-help">
              Set your hourly rate between $5 and $500
            </span>
          </div>
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

      <style jsx>{`
        .subject-suggestions {
          margin-top: 0.5rem;
          padding: 1rem;
          background: var(--gray-50);
          border-radius: var(--radius-md);
          border: 1px solid var(--gray-200);
        }

        .suggestions-label {
          font-size: 0.875rem;
          color: var(--gray-600);
          margin-bottom: 0.5rem;
        }

        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .suggestion-btn {
          background: white;
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          color: var(--gray-700);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .suggestion-btn:hover {
          background: var(--primary-50);
          border-color: var(--primary-300);
          color: var(--primary-700);
        }

        .input-with-prefix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix {
          position: absolute;
          left: 0.75rem;
          color: var(--gray-500);
          font-weight: 500;
          z-index: 1;
        }

        .input-with-prefix .form-input {
          padding-left: 2rem;
        }
      `}</style>
    </form>
  );
};

export default TutorProfileForm;
