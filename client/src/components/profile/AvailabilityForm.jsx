import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import './AvailabilityForm.css';

const AvailabilityForm = ({ profileData, onUpdate, isLoading }) => {
  const [availability, setAvailability] = useState({
    monday: { available: false },
    tuesday: { available: false },
    wednesday: { available: false },
    thursday: { available: false },
    friday: { available: false },
    saturday: { available: false },
    sunday: { available: false }
  });
  const [hasChanges, setHasChanges] = useState(false);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    if (profileData?.availability) {
      setAvailability(profileData.availability);
    }
  }, [profileData]);

  // Removed handleAvailabilityChange since we no longer need time inputs

  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        available: !prev[day].available
      }
    }));
    setHasChanges(true);
  };

  const handleSetAllDays = (available) => {
    const newAvailability = { ...availability };
    Object.keys(newAvailability).forEach(day => {
      newAvailability[day] = {
        available
      };
    });
    setAvailability(newAvailability);
    setHasChanges(true);
  };

  const handleSetWeekdays = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const newAvailability = { ...availability };
    weekdays.forEach(day => {
      newAvailability[day] = {
        available: true
      };
    });
    setAvailability(newAvailability);
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onUpdate({ availability });
      setHasChanges(false);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleReset = () => {
    if (profileData?.availability) {
      setAvailability(profileData.availability);
      setHasChanges(false);
    }
  };

  const getAvailableDaysCount = () => {
    return Object.values(availability).filter(day => day.available).length;
  };

  // Removed getTotalHours since we no longer track time

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Availability Schedule</h2>
      
      <div className="form-section">
        <div className="availability-header">
          <h3>Weekly Availability</h3>
          <div className="availability-stats">
            <span className="stat">
              {getAvailableDaysCount()} days selected
            </span>
          </div>
        </div>
        
        <div className="availability-actions">
          <button
            type="button"
            onClick={() => handleSetAllDays(true)}
            className="btn btn-outline btn-sm"
            disabled={isLoading}
          >
            Select All Days
          </button>
          <button
            type="button"
            onClick={handleSetWeekdays}
            className="btn btn-outline btn-sm"
            disabled={isLoading}
          >
            Weekdays Only
          </button>
          <button
            type="button"
            onClick={() => handleSetAllDays(false)}
            className="btn btn-outline btn-sm"
            disabled={isLoading}
          >
            Clear All
          </button>
        </div>

        <div className="availability-grid">
          {daysOfWeek.map(({ key, label }) => (
            <div key={key} className={`availability-day ${availability[key].available ? 'available' : ''}`}>
              <div className="day-label">{label}</div>
              <div className="day-controls">
                <div className="day-toggle">
                  <input
                    type="checkbox"
                    id={`${key}-available`}
                    checked={availability[key].available}
                    onChange={() => handleToggleDay(key)}
                    className="checkbox"
                    disabled={isLoading}
                  />
                  <label htmlFor={`${key}-available`} className="checkbox-text">
                    Available
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="availability-note">
          <p>
            <strong>Note:</strong> Select the days when you're available for tutoring sessions.
            Students can request sessions on these days, and you can coordinate specific times directly with them.
          </p>
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
            'Save Availability'
          )}
        </button>
      </div>


    </form>
  );
};

export default AvailabilityForm;
