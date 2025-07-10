import React, { useState } from 'react';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Ban,
  PartyPopper,
  Clock,
  MessageCircle,
  Users,
  Star,
  DollarSign,
  AlertTriangle,
  Megaphone,
  User,
  Video,
  Check,
  Trash2,
  MoreVertical
} from 'lucide-react';
import './NotificationItem.css';

const NotificationItem = ({ 
  notification, 
  isSelected, 
  onSelect, 
  onClick, 
  onMarkAsRead, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = (type) => {
    const iconMap = {
      'session_request': <Calendar size={20} />,
      'session_approved': <CheckCircle size={20} />,
      'session_rejected': <XCircle size={20} />,
      'session_cancelled': <Ban size={20} />,
      'session_completed': <PartyPopper size={20} />,
      'session_reminder': <Clock size={20} />,
      'new_message': <MessageCircle size={20} />,
      'tutor_approved': <Users size={20} />,
      'tutor_rejected': <XCircle size={20} />,
      'rating_received': <Star size={20} />,
      'payment_received': <DollarSign size={20} />,
      'payment_failed': <AlertTriangle size={20} />,
      'system_announcement': <Megaphone size={20} />,
      'account_update': <User size={20} />,
      'video_call_started': <Video size={20} />,
      'video_call_ended': <Video size={20} />
    };

    return iconMap[type] || <Megaphone size={20} />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      'session_request': 'blue',
      'session_approved': 'green',
      'session_rejected': 'red',
      'session_cancelled': 'red',
      'session_completed': 'green',
      'session_reminder': 'orange',
      'new_message': 'blue',
      'tutor_approved': 'green',
      'tutor_rejected': 'red',
      'rating_received': 'yellow',
      'payment_received': 'green',
      'payment_failed': 'red',
      'system_announcement': 'purple',
      'account_update': 'blue',
      'video_call_started': 'blue',
      'video_call_ended': 'gray'
    };
    
    return colors[type] || 'gray';
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(notificationDate);
  };

  const handleClick = (e) => {
    // Don't trigger click if clicking on actions or checkbox
    if (e.target.closest('.notification-actions') || e.target.closest('.notification-checkbox')) {
      return;
    }
    
    onClick(notification);
  };

  const handleCheckboxChange = (e) => {
    onSelect(notification._id, e.target.checked);
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead(notification._id);
    setShowActions(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification._id);
    setShowActions(false);
  };

  const handleActionToggle = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  return (
    <div 
      className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
      onClick={handleClick}
    >
      {/* Selection Checkbox */}
      <div className="notification-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Notification Icon */}
      <div className={`notification-icon ${getNotificationColor(notification.type)}`}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Notification Content */}
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <div className="notification-meta">
            <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
            {!notification.isRead && <span className="unread-indicator">●</span>}
          </div>
        </div>

        <p className="notification-message">{notification.message}</p>

        {/* Sender Info */}
        {notification.sender && (
          <div className="notification-sender">
            <img
              src={getAvatarUrl(notification.sender)}
              alt={`${notification.sender.firstName} ${notification.sender.lastName}`}
              className="sender-avatar"
            />
            <span className="sender-name">
              {notification.sender.firstName} {notification.sender.lastName}
            </span>
          </div>
        )}

        {/* Action Button */}
        {notification.actionUrl && notification.actionText && (
          <div className="notification-action">
            <button className="action-button">
              {notification.actionText}
            </button>
          </div>
        )}

        {/* Priority Indicator */}
        {notification.priority === 'urgent' && (
          <div className="priority-indicator">
            <span className="priority-badge urgent">Urgent</span>
          </div>
        )}
      </div>

      {/* Actions Menu */}
      <div className="notification-actions">
        <button
          onClick={handleActionToggle}
          className="actions-toggle"
          title="More actions"
        >
          <MoreVertical size={16} />
        </button>

        {showActions && (
          <div className="actions-menu">
            {!notification.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="action-menu-item"
              >
                <span className="action-icon">
                  <Check size={16} />
                </span>
                Mark as read
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="action-menu-item delete"
            >
              <span className="action-icon">
                <Trash2 size={16} />
              </span>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
