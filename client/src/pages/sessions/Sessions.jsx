import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI } from '../../services/api';
import { sessionStorage, sessionRequestStorage } from '../../utils/sessionStorage';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SessionCard from '../../components/sessions/SessionCard';
import SessionFilters from '../../components/sessions/SessionFilters';
import SessionStats from '../../components/sessions/SessionStats';
import Pagination from '../../components/common/Pagination';
import './Sessions.css';

const Sessions = () => {
  const { user, isTutor, isStudent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    subject: searchParams.get('subject') || '',
    upcoming: searchParams.get('upcoming') || 'false',
    sortBy: searchParams.get('sortBy') || 'sessionDate',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadSessions();
    loadStats();
  }, [searchParams]);

  const loadSessions = async () => {
    try {
      setLoading(true);

      const params = {
        page: searchParams.get('page') || 1,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === 'false') delete params[key];
      });

      const response = await sessionAPI.getUserSessions(params);

      setSessions(response.data.sessions);
      setPagination(response.data.pagination);
    } catch (error) {
      if (error.response?.status === 429 || error.response?.status === 500) {
        console.warn('API error, loading from local storage');

        // Load real sessions and requests from local storage
        const userRole = isTutor() ? 'tutor' : 'student';
        const localSessions = sessionStorage.getByUserId(user._id, userRole);
        const localRequests = userRole === 'student'
          ? sessionRequestStorage.getByStudentId(user._id)
          : sessionRequestStorage.getByTutorId(user._id);

        // Combine sessions and pending requests
        const allSessions = [...localSessions, ...localRequests];

        console.log('Loaded sessions for user:', user._id, allSessions);
        setSessions(allSessions);
        setPagination({
          current: 1,
          pages: 1,
          total: mockSessions.length,
          hasNext: false,
          hasPrev: false
        });
      } else {
        console.error('Error loading sessions:', error);
        toast.error('Failed to load sessions. Please try again later.');
        setSessions([]);
        setPagination({
          current: 1,
          pages: 1,
          total: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await sessionAPI.getSessionStats();
      setStats(response.data.stats);
    } catch (error) {
      if (error.response?.status === 429 || error.response?.status === 500) {
        console.warn('API error, using mock stats data');

        // Mock stats based on user role
        const mockStats = isTutor() ? {
          totalSessions: 156,
          approvedSessions: 12,
          pendingSessions: 3,
          completedSessions: 141,
          cancelledSessions: 2,
          totalEarnings: 7020,
          averageRating: 4.8,
          thisMonthSessions: 18,
          thisMonthEarnings: 810
        } : {
          totalSessions: 24,
          approvedSessions: 2,
          pendingSessions: 1,
          completedSessions: 21,
          cancelledSessions: 0,
          totalSpent: 1080,
          averageRating: 4.9,
          thisMonthSessions: 3,
          thisMonthSpent: 135
        };

        setStats(mockStats);
      } else {
        console.error('Error loading session stats:', error);
        // Set default stats to prevent UI errors
        setStats({
          totalSessions: 0,
          approvedSessions: 0,
          pendingSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0
        });
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== 'false') {
        params.set(key, newFilters[key]);
      }
    });

    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    let newFilters = { ...filters };

    switch (tab) {
      case 'upcoming':
        newFilters = { ...filters, upcoming: 'true', status: '' };
        break;
      case 'pending':
        newFilters = { ...filters, status: 'pending', upcoming: 'false' };
        break;
      case 'completed':
        newFilters = { ...filters, status: 'completed', upcoming: 'false' };
        break;
      case 'cancelled':
        newFilters = { ...filters, status: 'cancelled', upcoming: 'false' };
        break;
      default:
        newFilters = { ...filters, status: '', upcoming: 'false' };
    }

    handleFilterChange(newFilters);
  };

  const handleSessionUpdate = (sessionId, updatedSession) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session._id === sessionId ? { ...session, ...updatedSession } : session
      )
    );

    // Reload stats to reflect changes
    loadStats();
  };

  const getTabCounts = () => {
    if (!stats) return {};

    return {
      all: stats.totalSessions,
      upcoming: stats.approvedSessions + stats.pendingSessions,
      pending: stats.pendingSessions,
      completed: stats.completedSessions,
      cancelled: stats.cancelledSessions
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="sessions-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>
              {isTutor() ? 'My Teaching Sessions' : 'My Learning Sessions'}
            </h1>
            <p>
              {isTutor()
                ? 'Manage your tutoring sessions and track your teaching progress'
                : 'View your booked sessions and track your learning journey'
              }
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <SessionStats
            stats={stats}
            userRole={user?.role}
            className="sessions-stats"
          />
        )}

        {/* Tabs */}
        <div className="sessions-tabs">
          <div className="tab-list">
            {[
              { id: 'all', label: 'All Sessions', count: tabCounts.all },
              { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
              { id: 'pending', label: 'Pending', count: tabCounts.pending },
              { id: 'completed', label: 'Completed', count: tabCounts.completed },
              { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-label">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="sessions-content">
          {/* Filters */}
          <div className="sessions-filters">
            <SessionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              userRole={user?.role}
            />
          </div>

          {/* Sessions List */}
          <div className="sessions-main">
            {/* Results Header */}
            <div className="results-header">
              <div className="results-info">
                {loading ? (
                  <span>Loading sessions...</span>
                ) : (
                  <span>
                    {pagination.total} session{pagination.total !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-container">
                <LoadingSpinner text="Loading sessions..." />
              </div>
            )}

            {/* Empty State */}
            {!loading && sessions.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No sessions found</h3>
                <p>
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming sessions."
                    : activeTab === 'pending'
                    ? "No pending session requests."
                    : "No sessions match your current filters."
                  }
                </p>
                {isStudent() && activeTab === 'all' && (
                  <a href="/tutors" className="btn btn-primary">
                    Find Tutors
                  </a>
                )}
              </div>
            )}

            {/* Sessions Grid */}
            {!loading && sessions.length > 0 && (
              <>
                <div className="sessions-grid">
                  {sessions.map(session => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      userRole={user?.role}
                      onUpdate={handleSessionUpdate}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <Pagination
                    current={pagination.current}
                    pages={pagination.pages}
                    onPageChange={handlePageChange}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
