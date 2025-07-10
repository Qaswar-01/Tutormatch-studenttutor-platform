import React from 'react';
import { formatDate } from '../../utils/helpers';
import './AnalyticsOverview.css';

const AnalyticsOverview = ({ analytics, onRefresh }) => {
  if (!analytics) return null;

  const { overview, recentActivity, topSubjects, topTutors, monthlyStats } = analytics;

  // Get current supported subjects from localStorage
  const getSupportedSubjects = () => {
    try {
      const savedSettings = localStorage.getItem('platformSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return settings.supportedSubjects || [];
      }
    } catch (error) {
      console.error('Error loading supported subjects:', error);
    }
    // Default subjects if no saved settings
    return ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Languages', 'Arts', 'Music'];
  };

  // Filter topSubjects to only show supported subjects
  const supportedSubjects = getSupportedSubjects();
  const filteredTopSubjects = topSubjects.filter(subject =>
    supportedSubjects.includes(subject._id)
  );

  const getGrowthPercentage = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'gray';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  return (
    <div className="analytics-overview">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h2>Platform Analytics</h2>
          <p>Real-time insights into platform performance and user activity</p>
        </div>
        <button onClick={onRefresh} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card users">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <div className="metric-value">{formatNumber(overview.totalUsers)}</div>
            <div className="metric-breakdown">
              <span>Students: {formatNumber(overview.totalStudents)}</span>
              <span>Tutors: {formatNumber(overview.totalTutors)}</span>
            </div>
          </div>
          <div className="metric-trend positive">
            +{recentActivity.newUsersLast30Days} this month
          </div>
        </div>

        <div className="metric-card sessions">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Total Sessions</h3>
            <div className="metric-value">{formatNumber(overview.totalSessions)}</div>
            <div className="metric-breakdown">
              <span>Completed: {formatNumber(overview.completedSessions)}</span>
              <span>Pending: {formatNumber(overview.pendingSessions)}</span>
            </div>
          </div>
          <div className="metric-trend positive">
            +{recentActivity.sessionsLast30Days} this month
          </div>
        </div>

        <div className="metric-card ratings">
          <div className="metric-icon">⭐</div>
          <div className="metric-content">
            <h3>Platform Rating</h3>
            <div className="metric-value">{overview.averageRating.toFixed(1)}</div>
            <div className="metric-breakdown">
              <span>Total Reviews: {formatNumber(overview.totalRatings)}</span>
            </div>
          </div>
          <div className="metric-trend neutral">
            Excellent rating
          </div>
        </div>

        <div className="metric-card pending">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>Pending Approvals</h3>
            <div className="metric-value">{overview.pendingTutors}</div>
            <div className="metric-breakdown">
              <span>Tutor Applications</span>
            </div>
          </div>
          <div className={`metric-trend ${overview.pendingTutors > 0 ? 'warning' : 'neutral'}`}>
            {overview.pendingTutors > 0 ? 'Requires attention' : 'All caught up'}
          </div>
        </div>
      </div>



      {/* Charts Section */}
      <div className="charts-section">
        {/* Monthly Sessions Chart */}
        <div className="chart-card">
          <h3>Monthly Session Trends</h3>
          <div className="chart-container">
            <div className="simple-chart">
              {monthlyStats.map((stat, index) => {
                const maxSessions = Math.max(...monthlyStats.map(s => s.sessions));
                const height = (stat.sessions / maxSessions) * 100;
                
                return (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${height}%` }}
                      title={`${getMonthName(stat._id.month)} ${stat._id.year}: ${stat.sessions} sessions`}
                    />
                    <div className="bar-label">
                      {getMonthName(stat._id.month)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Subjects */}
        <div className="chart-card">
          <h3>Popular Subjects</h3>
          <div className="subjects-list">
            {filteredTopSubjects.length > 0 ? (
              filteredTopSubjects.slice(0, 8).map((subject, index) => {
                const maxCount = filteredTopSubjects[0]?.count || 1;
                const percentage = (subject.count / maxCount) * 100;

                return (
                  <div key={index} className="subject-item">
                    <div className="subject-info">
                      <span className="subject-name">{subject._id}</span>
                      <span className="subject-count">{subject.count} sessions</span>
                    </div>
                    <div className="subject-bar">
                      <div
                        className="subject-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              supportedSubjects.slice(0, 8).map((subject, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-info">
                    <span className="subject-name">{subject}</span>
                    <span className="subject-count">0 sessions</span>
                  </div>
                  <div className="subject-bar">
                    <div
                      className="subject-fill"
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Tutors Section */}
      <div className="top-tutors-section">
        <h3>Top Rated Tutors</h3>
        <div className="tutors-grid">
          {topTutors.slice(0, 6).map((tutor, index) => (
            <div key={tutor._id} className="tutor-card">
              <div className="tutor-rank">#{index + 1}</div>
              <div className="tutor-info">
                <h4>{tutor.firstName} {tutor.lastName}</h4>
                <div className="tutor-rating">
                  <span className="rating-stars">
                    {'★'.repeat(Math.floor(tutor.averageRating))}
                    {'☆'.repeat(5 - Math.floor(tutor.averageRating))}
                  </span>
                  <span className="rating-value">{tutor.averageRating.toFixed(1)}</span>
                </div>
                <div className="tutor-stats">
                  <span>{tutor.totalRatings} reviews</span>
                  <span>{tutor.subjects.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Status Distribution */}
      <div className="status-distribution">
        <h3>Session Status Distribution</h3>
        <div className="status-grid">
          <div className={`status-item ${getStatusColor('completed')}`}>
            <div className="status-icon">✅</div>
            <div className="status-info">
              <span className="status-count">{overview.completedSessions}</span>
              <span className="status-label">Completed</span>
            </div>
          </div>
          
          <div className={`status-item ${getStatusColor('approved')}`}>
            <div className="status-icon">👍</div>
            <div className="status-info">
              <span className="status-count">{overview.approvedSessions}</span>
              <span className="status-label">Approved</span>
            </div>
          </div>
          
          <div className={`status-item ${getStatusColor('pending')}`}>
            <div className="status-icon">⏳</div>
            <div className="status-info">
              <span className="status-count">{overview.pendingSessions}</span>
              <span className="status-label">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
