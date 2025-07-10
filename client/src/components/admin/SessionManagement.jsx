import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import {
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  UserX,
  ThumbsUp,
  HelpCircle
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import './SessionManagement.css';

const SessionManagement = ({ analytics }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    subject: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadSessions();
  }, [filters]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllSessions(filters);
      setSessions(response.data.sessions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'primary';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'approved': return <ThumbsUp size={16} />;
      case 'in-progress': return <RotateCcw size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'rejected': return <Ban size={16} />;
      case 'no-show': return <UserX size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="session-management-loading">
        <LoadingSpinner text="Loading sessions..." />
      </div>
    );
  }

  return (
    <div className="session-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <h2>Session Management</h2>
          <p>Monitor and manage tutoring sessions across the platform</p>
        </div>
        <div className="session-stats">
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.totalSessions || 0}</span>
            <span className="stat-label">Total Sessions</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.completedSessions || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.pendingSessions || 0}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="session-filters">
        <div className="filter-group">
          <label htmlFor="status" className="filter-label">Status:</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="subject" className="filter-label">Subject:</label>
          <input
            id="subject"
            type="text"
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            placeholder="Filter by subject..."
            className="filter-input"
          />
        </div>
      </div>

      {/* Sessions Table */}
      <div className="sessions-table-container">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Session Details</th>
              <th>Student</th>
              <th>Tutor</th>
              <th>Status</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session._id} className="session-row">
                <td className="session-details-cell">
                  <div className="session-info">
                    <div className="session-subject">{session.subject}</div>
                    <div className="session-id">ID: {session._id.slice(-8)}</div>
                    <div className="session-created">
                      Created: {formatDate(session.createdAt)}
                    </div>
                  </div>
                </td>
                
                <td className="user-cell">
                  <div className="user-info">
                    <img
                      src={getAvatarUrl(session.student)}
                      alt={`${session.student.firstName} ${session.student.lastName}`}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <div className="user-name">
                        {session.student.firstName} {session.student.lastName}
                      </div>
                      <div className="user-email">{session.student.email}</div>
                    </div>
                  </div>
                </td>
                
                <td className="user-cell">
                  <div className="user-info">
                    <img
                      src={getAvatarUrl(session.tutor)}
                      alt={`${session.tutor.firstName} ${session.tutor.lastName}`}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <div className="user-name">
                        {session.tutor.firstName} {session.tutor.lastName}
                      </div>
                      <div className="user-email">{session.tutor.email}</div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <span className={`status-badge ${getStatusColor(session.status)}`}>
                    {getStatusIcon(session.status)} {session.status.replace('-', ' ')}
                  </span>
                </td>
                
                <td className="date-cell">
                  <div className="date-info">
                    {session.scheduledDate ? (
                      <>
                        <div className="session-date">
                          {formatDate(session.scheduledDate)}
                        </div>
                        <div className="session-time">
                          {new Date(session.scheduledDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="no-date">Not scheduled</span>
                    )}
                  </div>
                </td>
                
                <td className="duration-cell">
                  {session.duration} hours
                  {session.actualDuration && session.actualDuration !== session.duration && (
                    <div className="actual-duration">
                      Actual: {Math.round(session.actualDuration / 60)} hours
                    </div>
                  )}
                </td>
                
                <td className="amount-cell">
                  <div className="amount-info">
                    <div className="total-amount">${session.totalAmount}</div>
                    <div className="hourly-rate">${session.hourlyRate}/hr</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sessions.length === 0 && !loading && (
          <div className="no-sessions">
            <div className="no-sessions-icon">📅</div>
            <h3>No sessions found</h3>
            <p>No sessions match your current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="session-pagination">
          <button
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.current} of {pagination.pages} 
            ({pagination.total} total sessions)
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
