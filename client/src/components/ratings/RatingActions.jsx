import React, { useState } from 'react';
import Modal from '../common/Modal';
import './RatingActions.css';

const RatingActions = ({ rating, isOwnRating, onFlag, onUpdate }) => {
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const flagReasons = [
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'spam', label: 'Spam or promotional content' },
    { value: 'fake', label: 'Fake or misleading review' },
    { value: 'offensive', label: 'Offensive language' },
    { value: 'other', label: 'Other reason' }
  ];

  const handleFlag = () => {
    if (!flagReason) return;
    
    onFlag(flagReason);
    setShowFlagModal(false);
    setFlagReason('');
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tutor Review',
        text: `Check out this review: "${rating.comment}"`,
        url: window.location.href
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  return (
    <div className="rating-actions">
      <div className="action-buttons">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="action-btn share-btn"
          title="Share this review"
        >
          🔗 Share
        </button>

        {/* Edit Button (for own ratings) */}
        {isOwnRating && (
          <button
            onClick={handleEdit}
            className="action-btn edit-btn"
            title="Edit your review"
          >
            ✏️ Edit
          </button>
        )}

        {/* Flag Button (for others' ratings) */}
        {!isOwnRating && (
          <button
            onClick={() => setShowFlagModal(true)}
            className="action-btn flag-btn"
            title="Report this review"
          >
            🚩 Report
          </button>
        )}
      </div>

      {/* Flag Modal */}
      <Modal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        title="Report Review"
      >
        <div className="flag-modal">
          <p>Why are you reporting this review?</p>
          
          <div className="flag-reasons">
            {flagReasons.map(reason => (
              <label key={reason.value} className="flag-reason">
                <input
                  type="radio"
                  name="flagReason"
                  value={reason.value}
                  checked={flagReason === reason.value}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="radio"
                />
                <span className="radio-text">{reason.label}</span>
              </label>
            ))}
          </div>

          <div className="flag-disclaimer">
            <p>
              <strong>Note:</strong> False reports may result in account restrictions. 
              Only report reviews that violate our community guidelines.
            </p>
          </div>

          <div className="modal-actions">
            <button
              onClick={() => setShowFlagModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleFlag}
              disabled={!flagReason}
              className="btn btn-error"
            >
              Report Review
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal Placeholder */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Review"
      >
        <div className="edit-modal">
          <p>Edit functionality will be implemented in the next update.</p>
          <div className="modal-actions">
            <button
              onClick={() => setShowEditModal(false)}
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

export default RatingActions;
