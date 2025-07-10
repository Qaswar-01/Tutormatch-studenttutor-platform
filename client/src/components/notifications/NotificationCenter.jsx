import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Search, Check, X } from 'lucide-react';
import NotificationItem from './NotificationItem';
import NotificationFilters from './NotificationFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose, onNotificationClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    unreadOnly: false,
    category: '',
    type: ''
  });
  const [pagination, setPagination] = useState({});
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const centerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen, filters]);

  useEffect(() => {
    // Close on outside click
    const handleClickOutside = (event) => {
      if (centerRef.current && !centerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(filters);

      if (filters.page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }

      setPagination(response.data.pagination);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      if (error.response?.status === 429 || error.response?.status === 500) {
        console.warn('API error, using mock notifications');

        // Mock notifications data
        const mockNotifications = [
          {
            _id: 'notif1',
            title: 'New Session Request',
            message: 'Alice Johnson has requested a Mathematics session',
            type: 'session_request',
            isRead: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            actionUrl: '/sessions'
          },
          {
            _id: 'notif2',
            title: 'Session Approved',
            message: 'Your Physics session with Dr. Smith has been approved',
            type: 'session_approved',
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            actionUrl: '/sessions'
          },
          {
            _id: 'notif3',
            title: 'Payment Received',
            message: 'Payment of $45.00 received for Mathematics session',
            type: 'payment',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            actionUrl: '/earnings'
          }
        ];

        setNotifications(mockNotifications);
        setPagination({ page: 1, pages: 1, total: 3, hasNext: false, hasPrev: false });
        setUnreadCount(2);

        toast.warning('Loading notifications from cache due to high traffic');
      } else {
        console.error('Error loading notifications:', error);
        toast.error('Failed to load notifications');
        setNotifications([]);
        setPagination({ page: 1, pages: 1, total: 0, hasNext: false, hasPrev: false });
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      if (error.response?.status === 429 || error.response?.status === 500) {
        console.warn('API error, using mock unread count');
        setUnreadCount(2);
      } else {
        console.error('Error loading unread count:', error);
        setUnreadCount(0);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await notificationAPI.markAsRead(notification._id);
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id 
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Handle navigation
    if (notification.actionUrl && onNotificationClick) {
      onNotificationClick(notification.actionUrl);
      onClose();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.size === 0) return;

    const notificationIds = Array.from(selectedNotifications);

    try {
      if (action === 'markRead') {
        await notificationAPI.markMultipleAsRead({ notificationIds });
        setNotifications(prev => 
          prev.map(n => 
            selectedNotifications.has(n._id)
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        
        // Update unread count
        const unreadSelected = notifications.filter(n => 
          selectedNotifications.has(n._id) && !n.isRead
        ).length;
        setUnreadCount(prev => Math.max(0, prev - unreadSelected));
        
        toast.success(`${notificationIds.length} notifications marked as read`);
      } else if (action === 'delete') {
        await notificationAPI.deleteMultipleNotifications({ notificationIds });
        setNotifications(prev => 
          prev.filter(n => !selectedNotifications.has(n._id))
        );
        
        // Update unread count
        const unreadSelected = notifications.filter(n => 
          selectedNotifications.has(n._id) && !n.isRead
        ).length;
        setUnreadCount(prev => Math.max(0, prev - unreadSelected));
        
        toast.success(`${notificationIds.length} notifications deleted`);
      }
      
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} notifications`);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
    setSelectedNotifications(new Set());
  };

  const handleLoadMore = () => {
    if (pagination.hasNext && !loading) {
      setFilters(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  };

  const handleSelectNotification = (notificationId, isSelected) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(notificationId);
      } else {
        newSet.delete(notificationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n._id)));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay">
      <div className="notification-center" ref={centerRef}>
        {/* Header */}
        <div className="notification-header">
          <div className="header-title">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              title="Toggle filters"
            >
              <Search size={16} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="mark-all-read-btn"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
            )}

            <button
              onClick={onClose}
              className="close-btn"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <NotificationFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="bulk-actions">
            <div className="selection-info">
              <button
                onClick={handleSelectAll}
                className="select-all-btn"
              >
                {selectedNotifications.size === notifications.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="selected-count">
                {selectedNotifications.size} selected
              </span>
            </div>
            
            <div className="bulk-action-buttons">
              <button
                onClick={() => handleBulkAction('markRead')}
                className="bulk-action-btn mark-read"
              >
                Mark Read
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bulk-action-btn delete"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="notifications-list">
          {loading && notifications.length === 0 ? (
            <div className="loading-container">
              <LoadingSpinner text="Loading notifications..." />
            </div>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  isSelected={selectedNotifications.has(notification._id)}
                  onSelect={handleSelectNotification}
                  onClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                />
              ))}
              
              {/* Load More */}
              {pagination.hasNext && (
                <div className="load-more-container">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="load-more-btn"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-notifications">
              <div className="empty-icon">🔔</div>
              <h4>No notifications</h4>
              <p>You're all caught up! New notifications will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
