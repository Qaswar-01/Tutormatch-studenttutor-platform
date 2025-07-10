import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import './SessionStats.css';

const SessionStats = ({ stats, userRole, className = '' }) => {
  if (!stats) return null;

  const isStudent = userRole === 'student';
  const isTutor = userRole === 'tutor';

  const getCompletionRate = () => {
    if (stats.totalSessions === 0) return 0;
    return Math.round((stats.completedSessions / stats.totalSessions) * 100);
  };

  const getSuccessRate = () => {
    const successfulSessions = stats.completedSessions;
    const totalAttempted = stats.totalSessions - stats.pendingSessions;
    if (totalAttempted === 0) return 0;
    return Math.round((successfulSessions / totalAttempted) * 100);
  };

  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: <Calendar size={20} />,
      color: 'blue',
      show: true
    },
    {
      title: 'Completed',
      value: stats.completedSessions,
      icon: <CheckCircle size={20} />,
      color: 'green',
      show: true
    },
    {
      title: 'Pending',
      value: stats.pendingSessions,
      icon: <Clock size={20} />,
      color: 'yellow',
      show: true
    },
    {
      title: isTutor ? 'Total Earnings' : 'Total Spent',
      value: formatCurrency(stats.totalEarnings || 0),
      icon: <DollarSign size={20} />,
      color: 'green',
      show: true
    },
    {
      title: 'Hours Taught',
      value: `${(stats.totalHours || 0).toFixed(1)}h`,
      icon: <GraduationCap size={20} />,
      color: 'blue',
      show: isTutor
    },
    {
      title: 'Hours Learned',
      value: `${(stats.totalHours || 0).toFixed(1)}h`,
      icon: <BookOpen size={20} />,
      color: 'purple',
      show: isStudent
    },
    {
      title: 'Average Rating',
      value: stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A',
      icon: '⭐',
      color: 'yellow',
      show: isTutor && stats.averageRating > 0
    },
    {
      title: 'Completion Rate',
      value: `${getCompletionRate()}%`,
      icon: '📊',
      color: 'blue',
      show: stats.totalSessions > 0
    }
  ];

  const visibleStats = statCards.filter(stat => stat.show);

  return (
    <div className={`session-stats ${className}`}>
      <div className="stats-header">
        <h3>Session Overview</h3>
        <div className="stats-summary">
          <span className="summary-item">
            <span className="summary-label">Success Rate:</span>
            <span className="summary-value">{getSuccessRate()}%</span>
          </span>
          {stats.totalSessions > 0 && (
            <span className="summary-item">
              <span className="summary-label">Active Sessions:</span>
              <span className="summary-value">
                {stats.approvedSessions + stats.pendingSessions}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="stats-content">
        <div className="stats-cards-container">
          <div className="stats-grid">
            {visibleStats.map((stat, index) => (
              <div key={index} className={`stat-card stat-${stat.color}`}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-title">{stat.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bars - Sidebar */}
        {stats.totalSessions > 0 && (
          <div className="stats-sidebar">
            <div className="stats-progress">
              <div className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">Session Status Distribution</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-segment progress-completed"
                    style={{ width: `${(stats.completedSessions / stats.totalSessions) * 100}%` }}
                    title={`Completed: ${stats.completedSessions}`}
                  />
                  <div
                    className="progress-segment progress-pending"
                    style={{ width: `${(stats.pendingSessions / stats.totalSessions) * 100}%` }}
                    title={`Pending: ${stats.pendingSessions}`}
                  />
                  <div
                    className="progress-segment progress-approved"
                    style={{ width: `${(stats.approvedSessions / stats.totalSessions) * 100}%` }}
                    title={`Approved: ${stats.approvedSessions}`}
                  />
                  <div
                    className="progress-segment progress-cancelled"
                    style={{ width: `${(stats.cancelledSessions / stats.totalSessions) * 100}%` }}
                    title={`Cancelled: ${stats.cancelledSessions}`}
                  />
                </div>
                <div className="progress-legend">
                  <span className="legend-item">
                    <span className="legend-color progress-completed"></span>
                    Completed ({stats.completedSessions})
                  </span>
                  <span className="legend-item">
                    <span className="legend-color progress-pending"></span>
                    Pending ({stats.pendingSessions})
                  </span>
                  <span className="legend-item">
                    <span className="legend-color progress-approved"></span>
                    Approved ({stats.approvedSessions})
                  </span>
                  <span className="legend-item">
                    <span className="legend-color progress-cancelled"></span>
                    Cancelled ({stats.cancelledSessions})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Quick Actions */}
      <div className="stats-actions">
        {isStudent && (
          <a href="/tutors" className="stats-action-btn">
            <span className="action-icon">🔍</span>
            Find More Tutors
          </a>
        )}
        {isTutor && (
          <a href="/profile" className="stats-action-btn">
            <span className="action-icon">⚙️</span>
            Update Availability
          </a>
        )}
        <button className="stats-action-btn" onClick={() => window.print()}>
          <span className="action-icon">📊</span>
          Export Report
        </button>
      </div>
    </div>
  );
};

export default SessionStats;
