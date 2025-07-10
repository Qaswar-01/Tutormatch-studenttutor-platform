import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import './UserManagement.css';

const UserManagement = ({ analytics }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    role: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(filters);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleStatusChange = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser) return;

    try {
      setProcessing(true);
      
      await adminAPI.updateUserStatus(selectedUser._id, {
        isActive: !selectedUser.isActive
      });

      toast.success(
        `User ${selectedUser.isActive ? 'deactivated' : 'activated'} successfully`
      );

      // Update the user in the list
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id 
          ? { ...user, isActive: !user.isActive }
          : user
      ));
      
      setShowStatusModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'tutor': return 'primary';
      case 'student': return 'success';
      default: return 'gray';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management-loading">
        <LoadingSpinner text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <h2>User Management</h2>
          <p>Manage platform users and their account status</p>
        </div>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.totalStudents || 0}</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.totalTutors || 0}</span>
            <span className="stat-label">Tutors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{analytics?.overview?.totalUsers || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="user-filters">
        <div className="filter-group">
          <label htmlFor="role" className="filter-label">Role:</label>
          <select
            id="role"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status" className="filter-label">Status:</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search" className="filter-label">Search:</label>
          <input
            id="search"
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by name or email..."
            className="filter-input"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className={`user-row ${!user.isActive ? 'inactive' : ''}`}>
                <td className="user-cell">
                  <div className="user-info">
                    <img
                      src={getAvatarUrl(user)}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <span className={`role-badge ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                
                <td>
                  <div className="status-cell">
                    <span className={`status-badge ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {user.pendingApproval && (
                      <span className="pending-badge">Pending</span>
                    )}
                  </div>
                </td>
                
                <td className="date-cell">
                  {formatDate(user.createdAt)}
                </td>
                
                <td className="date-cell">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </td>
                
                <td className="actions-cell">
                  <button
                    onClick={() => handleStatusChange(user)}
                    className={`action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                    disabled={user.role === 'admin'}
                    title={user.role === 'admin' ? 'Cannot modify admin accounts' : ''}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <h3>No users found</h3>
            <p>No users match your current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="user-pagination">
          <button
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.current} of {pagination.pages} 
            ({pagination.total} total users)
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

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
      >
        <div className="status-modal">
          {selectedUser && (
            <>
              <div className="modal-user-info">
                <img
                  src={getAvatarUrl(selectedUser)}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="modal-avatar"
                />
                <div>
                  <h4>{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <p>{selectedUser.email}</p>
                  <span className={`role-badge ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="status-confirmation">
                <p>
                  Are you sure you want to {selectedUser.isActive ? 'deactivate' : 'activate'} this user?
                </p>
                {selectedUser.isActive ? (
                  <div className="warning-message">
                    <strong>Warning:</strong> Deactivating this user will prevent them from 
                    logging in and accessing the platform. All active sessions will be cancelled.
                  </div>
                ) : (
                  <div className="info-message">
                    This user will be able to log in and access the platform again.
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="btn btn-outline"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={processing}
                  className={`btn ${selectedUser.isActive ? 'btn-error' : 'btn-success'}`}
                >
                  {processing ? 'Processing...' : (selectedUser.isActive ? 'Deactivate' : 'Activate')}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
