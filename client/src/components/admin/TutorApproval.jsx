import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import './TutorApproval.css';

const TutorApproval = ({ analytics, onRefresh }) => {
  const [pendingTutors, setPendingTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadPendingTutors();
  }, []);

  const loadPendingTutors = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingTutors({ page, limit: 10 });
      setPendingTutors(response.data.tutors);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading pending tutors:', error);
      toast.error('Failed to load pending tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = (tutor, action) => {
    setSelectedTutor(tutor);
    setApprovalAction(action);
    setShowApprovalModal(true);
    setRejectionReason('');
  };

  const confirmApproval = async () => {
    if (!selectedTutor || !approvalAction) return;

    try {
      setProcessing(true);
      
      await adminAPI.approveTutor(selectedTutor._id, {
        action: approvalAction,
        rejectionReason: rejectionReason
      });

      toast.success(
        approvalAction === 'approve' 
          ? 'Tutor approved successfully!' 
          : 'Tutor application rejected'
      );

      // Remove the tutor from the list
      setPendingTutors(prev => prev.filter(t => t._id !== selectedTutor._id));
      
      // Refresh analytics
      onRefresh && onRefresh();
      
      setShowApprovalModal(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error processing tutor approval:', error);
      toast.error('Failed to process tutor approval');
    } finally {
      setProcessing(false);
    }
  };

  const getExperienceLevel = (experience) => {
    if (experience >= 5) return { label: 'Expert', color: 'success' };
    if (experience >= 2) return { label: 'Experienced', color: 'primary' };
    if (experience >= 1) return { label: 'Intermediate', color: 'warning' };
    return { label: 'Beginner', color: 'gray' };
  };

  if (loading && pendingTutors.length === 0) {
    return (
      <div className="tutor-approval-loading">
        <LoadingSpinner text="Loading pending tutors..." />
      </div>
    );
  }

  return (
    <div className="tutor-approval">
      {/* Header */}
      <div className="approval-header">
        <div className="header-content">
          <h2>Tutor Approval Queue</h2>
          <p>Review and approve tutor applications</p>
        </div>
        <div className="approval-stats">
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.pendingTutors || 0}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.totalTutors || 0}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
      </div>

      {/* Tutors List */}
      {pendingTutors.length > 0 ? (
        <div className="tutors-list">
          {pendingTutors.map(tutor => {
            const experienceLevel = getExperienceLevel(tutor.experience);
            
            return (
              <div key={tutor._id} className="tutor-application-card">
                {/* Header */}
                <div className="application-header">
                  <div className="tutor-basic-info">
                    <img
                      src={getAvatarUrl(tutor)}
                      alt={`${tutor.firstName} ${tutor.lastName}`}
                      className="tutor-avatar"
                    />
                    <div className="tutor-details">
                      <h3>{tutor.firstName} {tutor.lastName}</h3>
                      <p className="tutor-email">{tutor.email}</p>
                      <div className="application-meta">
                        <span className="application-date">
                          Applied {formatDate(tutor.createdAt)}
                        </span>
                        <span className={`experience-badge ${experienceLevel.color}`}>
                          {experienceLevel.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="approval-actions">
                    <button
                      onClick={() => handleApprovalAction(tutor, 'approve')}
                      className="btn btn-success btn-sm"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleApprovalAction(tutor, 'reject')}
                      className="btn btn-error btn-sm btn-outline"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="application-content">
                  {/* Subjects */}
                  <div className="info-section">
                    <h4>Subjects</h4>
                    <div className="subjects-list">
                      {tutor.subjects.map((subject, index) => (
                        <span key={index} className="subject-tag">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience & Education */}
                  <div className="info-grid">
                    <div className="info-section">
                      <h4>Experience</h4>
                      <p>{tutor.experience} years of tutoring experience</p>
                      {tutor.hourlyRate && (
                        <p className="hourly-rate">${tutor.hourlyRate}/hour</p>
                      )}
                    </div>

                    <div className="info-section">
                      <h4>Education</h4>
                      <p>{tutor.education || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {tutor.bio && (
                    <div className="info-section">
                      <h4>Bio</h4>
                      <p className="tutor-bio">{tutor.bio}</p>
                    </div>
                  )}

                  {/* Availability */}
                  {tutor.availability && tutor.availability.length > 0 && (
                    <div className="info-section">
                      <h4>Availability</h4>
                      <div className="availability-grid">
                        {tutor.availability.map((slot, index) => (
                          <div key={index} className="availability-slot">
                            <span className="day">{slot.day}</span>
                            <span className="time">{slot.startTime} - {slot.endTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-pending-tutors">
          <div className="no-tutors-icon">🎉</div>
          <h3>All caught up!</h3>
          <p>There are no pending tutor applications to review.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="approval-pagination">
          <button
            onClick={() => loadPendingTutors(pagination.current - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            onClick={() => loadPendingTutors(pagination.current + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={approvalAction === 'approve' ? 'Approve Tutor' : 'Reject Application'}
      >
        <div className="approval-modal">
          {selectedTutor && (
            <>
              <div className="modal-tutor-info">
                <img
                  src={getAvatarUrl(selectedTutor)}
                  alt={`${selectedTutor.firstName} ${selectedTutor.lastName}`}
                  className="modal-avatar"
                />
                <div>
                  <h4>{selectedTutor.firstName} {selectedTutor.lastName}</h4>
                  <p>{selectedTutor.email}</p>
                </div>
              </div>

              {approvalAction === 'approve' ? (
                <div className="approval-confirmation">
                  <p>
                    Are you sure you want to approve this tutor application? 
                    The tutor will be notified and can start accepting sessions.
                  </p>
                </div>
              ) : (
                <div className="rejection-form">
                  <p>Please provide a reason for rejecting this application:</p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="rejection-textarea"
                    rows="4"
                    required
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="btn btn-outline"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={processing || (approvalAction === 'reject' && !rejectionReason.trim())}
                  className={`btn ${approvalAction === 'approve' ? 'btn-success' : 'btn-error'}`}
                >
                  {processing ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TutorApproval;
