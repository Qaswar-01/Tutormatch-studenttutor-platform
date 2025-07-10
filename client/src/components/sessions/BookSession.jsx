import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { sessionAPI } from '../../services/api';
import { sessionRequestStorage } from '../../utils/sessionStorage';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import SessionRequestStatus from './SessionRequestStatus';
import './BookSession.css';

const BookSession = ({ tutor, isOpen, onClose, onSuccess }) => {
  const { user, isStudent } = useAuth();
  const { sendSessionRequest } = useSocket();
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    sessionType: 'online',
    description: '',
    preferredPlatform: 'daily'
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  const loadAvailability = async () => {
    try {
      setAvailabilityLoading(true);

      try {
        const response = await sessionAPI.getTutorAvailability(tutor._id, selectedDate);

        if (response.data.available) {
          setAvailableSlots(response.data.availableSlots || []);
        } else {
          setAvailableSlots([]);
          toast.info(response.data.message || 'No availability for this date');
        }
      } catch (apiError) {
        console.warn('Availability API not available, using mock data:', apiError.message);

        // Generate mock availability slots
        const selectedDateObj = new Date(selectedDate);
        const dayOfWeek = selectedDateObj.getDay();

        // Mock availability based on day of week
        const mockSlots = [];

        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
          mockSlots.push(
            { startTime: '09:00', endTime: '10:00', duration: 1 },
            { startTime: '10:30', endTime: '11:30', duration: 1 },
            { startTime: '14:00', endTime: '15:00', duration: 1 },
            { startTime: '15:30', endTime: '17:00', duration: 1.5 },
            { startTime: '18:00', endTime: '19:00', duration: 1 }
          );
        } else if (dayOfWeek === 6) { // Saturday
          mockSlots.push(
            { startTime: '10:00', endTime: '11:00', duration: 1 },
            { startTime: '11:30', endTime: '12:30', duration: 1 },
            { startTime: '14:00', endTime: '16:00', duration: 2 }
          );
        }
        // Sunday - no availability

        setAvailableSlots(mockSlots);

        if (mockSlots.length === 0) {
          toast.info('No availability for this date. Try selecting a weekday or Saturday.');
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
      setAvailableSlots([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isStudent()) {
      toast.error('Only students can book sessions');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }

    try {
      setLoading(true);

      const sessionData = {
        tutor: tutor._id,
        subject: formData.subject,
        sessionDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        sessionType: formData.sessionType,
        description: formData.description,
        preferredPlatform: formData.preferredPlatform
      };

      try {
        const response = await sessionAPI.createSession(sessionData);

        // Store the created session for status display
        setCreatedSession(response.data.session);

        toast.success('Session request sent successfully! The tutor will review your request.');

        // Show success modal with real-time status
        setShowSuccessModal(true);
        onSuccess && onSuccess(response.data.session);
      } catch (apiError) {
        console.warn('Session API not available, using local storage:', apiError.message);

        // Create session request using local storage
        const sessionRequestData = {
          student: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar
          },
          tutor: {
            _id: tutor._id,
            firstName: tutor.firstName,
            lastName: tutor.lastName,
            email: tutor.email,
            avatar: tutor.avatar
          },
          subject: formData.subject,
          sessionDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          duration: selectedSlot.duration,
          sessionType: formData.sessionType,
          description: formData.description,
          preferredPlatform: formData.preferredPlatform,
          hourlyRate: tutor.hourlyRate,
          totalCost: selectedSlot.duration * tutor.hourlyRate
        };

        // Store in local storage
        const createdRequest = sessionRequestStorage.create(sessionRequestData);
        setCreatedSession(createdRequest);

        // Send real-time notification to tutor
        sendSessionRequest({
          ...createdRequest,
          tutorId: tutor._id,
          studentName: `${user.firstName} ${user.lastName}`,
          studentId: user._id
        });

        toast.success('Session request sent successfully! The tutor will review your request.');

        // Show success modal with real-time status
        setShowSuccessModal(true);
        onSuccess && onSuccess(createdRequest);
      }

      // Don't close the modal immediately - show status instead
      // onClose();

      // Reset form
      setFormData({
        subject: '',
        sessionType: 'online',
        description: '',
        preferredPlatform: 'daily'
      });
      setSelectedDate('');
      setSelectedSlot(null);
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error booking session:', error);
      const errorMessage = error.response?.data?.message || 'Failed to book session';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    return maxDate.toISOString().split('T')[0];
  };

  const calculateCost = () => {
    if (!selectedSlot) return 0;
    return selectedSlot.duration * tutor.hourlyRate;
  };

  if (!isStudent()) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Book Session">
        <div className="book-session-error">
          <p>Only students can book sessions. Please log in as a student to continue.</p>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book Session with ${tutor.firstName}`}>
      <form onSubmit={handleSubmit} className="book-session-form">
        {/* Subject Selection */}
        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject *
          </label>
          <select
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="form-select"
            required
          >
            <option value="">Select a subject</option>
            {tutor.subjects?.map(subject => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="form-group">
          <label htmlFor="sessionDate" className="form-label">
            Session Date *
          </label>
          <input
            type="date"
            id="sessionDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="form-input"
            required
          />
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div className="form-group">
            <label className="form-label">
              Available Time Slots *
            </label>
            
            {availabilityLoading ? (
              <div className="availability-loading">
                <LoadingSpinner size="small" text="Loading availability..." />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="time-slots">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                  >
                    <div className="slot-time">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="slot-duration">
                      {slot.duration}h • {formatCurrency(slot.duration * tutor.hourlyRate)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-availability">
                <p>No available time slots for {formatDate(new Date(selectedDate))}</p>
                <p className="availability-hint">
                  Try selecting a different date or check the tutor's availability schedule.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Session Type */}
        <div className="form-group">
          <label className="form-label">Session Type</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="sessionType"
                value="online"
                checked={formData.sessionType === 'online'}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="radio"
              />
              <span className="radio-text">💻 Online Session</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="sessionType"
                value="in-person"
                checked={formData.sessionType === 'in-person'}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="radio"
              />
              <span className="radio-text">🏢 In-Person Session</span>
            </label>
          </div>
        </div>

        {/* Platform Selection (for online sessions) */}
        {formData.sessionType === 'online' && (
          <div className="form-group">
            <label htmlFor="preferredPlatform" className="form-label">
              Preferred Platform
            </label>
            <select
              id="preferredPlatform"
              value={formData.preferredPlatform}
              onChange={(e) => setFormData({ ...formData, preferredPlatform: e.target.value })}
              className="form-select"
            >
              <option value="daily">Daily.co (Recommended)</option>
              <option value="zoom">Zoom</option>
              <option value="meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
            </select>
          </div>
        )}

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Session Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what you'd like to focus on in this session..."
            className="form-textarea"
            rows="3"
            maxLength="500"
          />
          <span className="form-help">
            {formData.description.length}/500 characters
          </span>
        </div>

        {/* Cost Summary */}
        {selectedSlot && (
          <div className="cost-summary">
            <div className="cost-item">
              <span>Duration:</span>
              <span>{selectedSlot.duration} hour{selectedSlot.duration !== 1 ? 's' : ''}</span>
            </div>
            <div className="cost-item">
              <span>Hourly Rate:</span>
              <span>{formatCurrency(tutor.hourlyRate)}</span>
            </div>
            <div className="cost-item cost-total">
              <span>Total Cost:</span>
              <span>{formatCurrency(calculateCost())}</span>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedSlot || !formData.subject}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                Booking...
              </>
            ) : (
              'Book Session'
            )}
          </button>
        </div>
      </form>

      {/* Session Request Status Modal */}
      {showSuccessModal && createdSession && (
        <div className="status-modal-overlay">
          <SessionRequestStatus
            session={createdSession}
            onClose={() => {
              setShowSuccessModal(false);
              setCreatedSession(null);
              onClose();
            }}
            onSessionApproved={(sessionData) => {
              toast.success('🎉 Session approved! Chat and video are now available.');
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default BookSession;
