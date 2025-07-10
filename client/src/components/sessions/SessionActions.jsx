import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';

import ChatButton from '../chat/ChatButton';
import './SessionActions.css';

const SessionActions = ({ session, userRole, onStatusUpdate, isUpcoming, isPast }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const isStudent = userRole === 'student';
  const isTutor = userRole === 'tutor';
  const canApprove = isTutor && session.status === 'pending';
  const canReject = isTutor && session.status === 'pending';
  const canCancel = (isStudent || isTutor) && ['pending', 'approved'].includes(session.status);
  const canReschedule = (isStudent || isTutor) && ['pending', 'approved'].includes(session.status) && isUpcoming;
  const canStart = isTutor && session.status === 'approved' && isUpcoming;
  const canComplete = isTutor && session.status === 'in-progress';
  const canRate = isStudent && session.status === 'completed' && !session.rating;

  const handleApprove = () => {
    onStatusUpdate('approved');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    onStatusUpdate('rejected', { rejectionReason });
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleCancel = () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    onStatusUpdate('cancelled', { cancellationReason });
    setShowCancelModal(false);
    setCancellationReason('');
  };

  const handleStart = () => {
    onStatusUpdate('in-progress');
  };

  const handleComplete = () => {
    if (window.confirm('Mark this session as completed?')) {
      onStatusUpdate('completed');
    }
  };

  const handleRate = async () => {
    try {
      const response = await fetch(`/api/sessions/${session._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, review, isPublic })
      });

      if (response.ok) {
        toast.success('Session rated successfully!');
        setShowRatingModal(false);
        onStatusUpdate('completed', { rating, review });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to rate session');
      }
    } catch (error) {
      console.error('Error rating session:', error);
      toast.error('Failed to rate session');
    }
  };

  const openMeeting = () => {
    if (session.meetingUrl) {
      window.open(session.meetingUrl, '_blank');
    } else {
      toast.error('Meeting URL not available');
    }
  };

  return (
    <div className="session-actions">
      {/* Approve Button */}
      {canApprove && (
        <button
          onClick={handleApprove}
          className="btn btn-success btn-sm"
        >
          ✅ Approve
        </button>
      )}

      {/* Reject Button */}
      {canReject && (
        <button
          onClick={() => setShowRejectModal(true)}
          className="btn btn-error btn-sm"
        >
          ❌ Reject
        </button>
      )}

      {/* Start Session Button */}
      {canStart && (
        <button
          onClick={handleStart}
          className="btn btn-primary btn-sm"
        >
          🚀 Start Session
        </button>
      )}

      {/* Complete Session Button */}
      {canComplete && (
        <button
          onClick={handleComplete}
          className="btn btn-success btn-sm"
        >
          ✅ Complete
        </button>
      )}

      {/* Join Meeting Button */}
      {session.status === 'approved' && session.meetingUrl && (
        <button
          onClick={openMeeting}
          className="btn btn-primary btn-sm"
        >
          🔗 Join Meeting
        </button>
      )}

      {/* Rate Session Button */}
      {canRate && (
        <button
          onClick={() => setShowRatingModal(true)}
          className="btn btn-warning btn-sm"
        >
          ⭐ Rate Session
        </button>
      )}

      {/* Reschedule Button */}
      {canReschedule && (
        <button
          onClick={() => setShowRescheduleModal(true)}
          className="btn btn-outline btn-sm"
        >
          📅 Reschedule
        </button>
      )}

      {/* Chat Button */}
      <ChatButton session={session} className="btn-sm" />

      {/* Cancel Button */}
      {canCancel && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="btn btn-error btn-sm btn-outline"
        >
          🚫 Cancel
        </button>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Session Request"
      >
        <div className="reject-modal">
          <p>Please provide a reason for rejecting this session request:</p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="form-textarea"
            rows="4"
            maxLength="300"
          />
          <div className="modal-actions">
            <button
              onClick={() => setShowRejectModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="btn btn-error"
              disabled={!rejectionReason.trim()}
            >
              Reject Session
            </button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Your Session"
      >
        <div className="rating-modal">
          <div className="rating-section">
            <label className="form-label">Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`star ${star <= rating ? 'active' : ''}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="review" className="form-label">
              Review (Optional)
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this session..."
              className="form-textarea"
              rows="4"
              maxLength="1000"
            />
            <span className="form-help">
              {review.length}/1000 characters
            </span>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="checkbox"
              />
              <span className="checkbox-text">
                Make this review public (visible to other students)
              </span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              onClick={() => setShowRatingModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleRate}
              className="btn btn-primary"
            >
              Submit Rating
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Session"
      >
        <div className="cancel-modal">
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <div>
              <h4>Are you sure you want to cancel this session?</h4>
              <p>This action cannot be undone. Please provide a reason for cancellation.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cancellationReason" className="form-label">
              Cancellation Reason *
            </label>
            <textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please explain why you're cancelling this session..."
              className="form-textarea"
              rows="4"
              maxLength="500"
              required
            />
            <span className="form-help">
              {cancellationReason.length}/500 characters
            </span>
          </div>

          <div className="session-info-summary">
            <h5>Session Details:</h5>
            <div className="summary-item">
              <strong>Subject:</strong> {session.subject || 'N/A'}
            </div>
            <div className="summary-item">
              <strong>Date:</strong> {session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : 'N/A'}
            </div>
            <div className="summary-item">
              <strong>Time:</strong> {session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : 'N/A'}
            </div>
            <div className="summary-item">
              <strong>Cost:</strong> {session.totalCost ? `$${session.totalCost}` : 'N/A'}
            </div>
          </div>

          <div className="modal-actions">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancellationReason('');
              }}
              className="btn btn-outline"
            >
              Keep Session
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-error"
              disabled={!cancellationReason.trim()}
            >
              Cancel Session
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal Placeholder */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Session"
      >
        <div className="reschedule-modal">
          <p>Reschedule functionality will be implemented in the next update.</p>
          <div className="modal-actions">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionActions;
