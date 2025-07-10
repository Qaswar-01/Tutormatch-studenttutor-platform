const Notification = require('../models/Notification');

class NotificationService {
  // Create a notification
  static async createNotification(data) {
    try {
      const notification = await Notification.createNotification(data);
      
      // Emit real-time notification if socket.io is available
      const io = global.io;
      if (io && notification.recipient) {
        io.to(`user_${notification.recipient}`).emit('newNotification', notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Session-related notifications
  static async notifySessionRequest(sessionData) {
    const { tutor, student, session } = sessionData;
    
    return this.createNotification({
      recipient: tutor._id,
      sender: student._id,
      type: 'session_request',
      category: 'session',
      title: 'New Session Request',
      message: `${student.firstName} ${student.lastName} has requested a ${session.subject} session.`,
      data: {
        sessionId: session._id,
        url: `/sessions/${session._id}`
      },
      actionRequired: true,
      actionUrl: `/sessions/${session._id}`,
      actionText: 'View Request',
      priority: 'high'
    });
  }

  static async notifySessionApproved(sessionData) {
    const { tutor, student, session } = sessionData;
    
    return this.createNotification({
      recipient: student._id,
      sender: tutor._id,
      type: 'session_approved',
      category: 'session',
      title: 'Session Approved!',
      message: `Your ${session.subject} session with ${tutor.firstName} ${tutor.lastName} has been approved.`,
      data: {
        sessionId: session._id,
        url: `/sessions/${session._id}`
      },
      actionUrl: `/sessions/${session._id}`,
      actionText: 'View Session',
      priority: 'high'
    });
  }

  static async notifySessionRejected(sessionData) {
    const { tutor, student, session, reason } = sessionData;
    
    return this.createNotification({
      recipient: student._id,
      sender: tutor._id,
      type: 'session_rejected',
      category: 'session',
      title: 'Session Request Declined',
      message: `Your ${session.subject} session request has been declined. ${reason ? `Reason: ${reason}` : ''}`,
      data: {
        sessionId: session._id,
        url: `/tutors`,
        metadata: { reason }
      },
      actionUrl: '/tutors',
      actionText: 'Find Other Tutors',
      priority: 'medium'
    });
  }

  static async notifySessionCancelled(sessionData) {
    const { tutor, student, session, cancelledBy, reason } = sessionData;
    const recipient = cancelledBy === 'student' ? tutor._id : student._id;
    const sender = cancelledBy === 'student' ? student._id : tutor._id;
    const senderName = cancelledBy === 'student' 
      ? `${student.firstName} ${student.lastName}`
      : `${tutor.firstName} ${tutor.lastName}`;
    
    return this.createNotification({
      recipient,
      sender,
      type: 'session_cancelled',
      category: 'session',
      title: 'Session Cancelled',
      message: `Your ${session.subject} session has been cancelled by ${senderName}. ${reason ? `Reason: ${reason}` : ''}`,
      data: {
        sessionId: session._id,
        url: `/sessions`,
        metadata: { reason, cancelledBy }
      },
      actionUrl: '/sessions',
      actionText: 'View Sessions',
      priority: 'high'
    });
  }

  static async notifySessionCompleted(sessionData) {
    const { tutor, student, session } = sessionData;
    
    // Notify student
    await this.createNotification({
      recipient: student._id,
      sender: tutor._id,
      type: 'session_completed',
      category: 'session',
      title: 'Session Completed!',
      message: `Your ${session.subject} session with ${tutor.firstName} ${tutor.lastName} has been completed.`,
      data: {
        sessionId: session._id,
        url: `/sessions/${session._id}/rate`
      },
      actionUrl: `/sessions/${session._id}/rate`,
      actionText: 'Rate Session',
      priority: 'medium'
    });

    // Notify tutor
    return this.createNotification({
      recipient: tutor._id,
      sender: student._id,
      type: 'session_completed',
      category: 'session',
      title: 'Session Completed!',
      message: `Your ${session.subject} session with ${student.firstName} ${student.lastName} has been completed.`,
      data: {
        sessionId: session._id,
        url: `/sessions/${session._id}`
      },
      actionUrl: `/sessions/${session._id}`,
      actionText: 'View Session',
      priority: 'medium'
    });
  }

  static async notifySessionReminder(sessionData) {
    const { tutor, student, session, reminderType } = sessionData;
    const timeUntil = reminderType === '24h' ? '24 hours' : '1 hour';
    
    // Notify both participants
    const notifications = [];
    
    // Student notification
    notifications.push(this.createNotification({
      recipient: student._id,
      type: 'session_reminder',
      category: 'session',
      title: `Session Reminder - ${timeUntil}`,
      message: `Your ${session.subject} session with ${tutor.firstName} ${tutor.lastName} starts in ${timeUntil}.`,
      data: {
        sessionId: session._id,
        url: `/sessions/${session._id}`
      },
      actionUrl: `/sessions/${session._id}`,
      actionText: 'Join Session',
      priority: 'high',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }));

    // Tutor notification
    notifications.push(this.createNotification({
      recipient: tutor._id,
      type: 'session_reminder',
      category: 'session',
      title: `Session Reminder - ${timeUntil}`,
      message: `Your ${session.subject} session with ${student.firstName} ${student.lastName} starts in ${timeUntil}.`,
      data: {
        sessionId: session._id,
        url: `/sessions/${session._id}`
      },
      actionUrl: `/sessions/${session._id}`,
      actionText: 'Join Session',
      priority: 'high',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }));

    return Promise.all(notifications);
  }

  // Message notifications
  static async notifyNewMessage(messageData) {
    const { sender, recipient, message, sessionId } = messageData;
    
    return this.createNotification({
      recipient: recipient._id,
      sender: sender._id,
      type: 'new_message',
      category: 'message',
      title: 'New Message',
      message: `${sender.firstName} ${sender.lastName} sent you a message: "${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}"`,
      data: {
        messageId: message._id,
        sessionId: sessionId,
        url: sessionId ? `/sessions/${sessionId}/chat` : '/messages'
      },
      actionUrl: sessionId ? `/sessions/${sessionId}/chat` : '/messages',
      actionText: 'View Message',
      priority: 'medium'
    });
  }

  // Tutor approval notifications
  static async notifyTutorApproved(tutorData) {
    const { tutor } = tutorData;
    
    return this.createNotification({
      recipient: tutor._id,
      type: 'tutor_approved',
      category: 'account',
      title: 'Tutor Application Approved!',
      message: 'Congratulations! Your tutor application has been approved. You can now start accepting sessions.',
      data: {
        url: '/dashboard'
      },
      actionUrl: '/dashboard',
      actionText: 'Go to Dashboard',
      priority: 'high'
    });
  }

  static async notifyTutorRejected(tutorData) {
    const { tutor, reason } = tutorData;
    
    return this.createNotification({
      recipient: tutor._id,
      type: 'tutor_rejected',
      category: 'account',
      title: 'Tutor Application Update',
      message: `Your tutor application has been reviewed. ${reason ? `Feedback: ${reason}` : 'Please review the requirements and apply again.'}`,
      data: {
        url: '/profile',
        metadata: { reason }
      },
      actionUrl: '/profile',
      actionText: 'Update Profile',
      priority: 'medium'
    });
  }

  // Rating notifications
  static async notifyRatingReceived(ratingData) {
    const { tutor, student, rating, session } = ratingData;
    
    return this.createNotification({
      recipient: tutor._id,
      sender: student._id,
      type: 'rating_received',
      category: 'account',
      title: 'New Rating Received',
      message: `${student.firstName} ${student.lastName} rated your ${session.subject} session ${rating.rating} stars.`,
      data: {
        ratingId: rating._id,
        sessionId: session._id,
        url: `/profile/ratings`
      },
      actionUrl: `/profile/ratings`,
      actionText: 'View Ratings',
      priority: 'low'
    });
  }

  // Payment notifications
  static async notifyPaymentReceived(paymentData) {
    const { tutor, amount, session } = paymentData;
    
    return this.createNotification({
      recipient: tutor._id,
      type: 'payment_received',
      category: 'payment',
      title: 'Payment Received',
      message: `You've received $${amount} for your ${session.subject} session.`,
      data: {
        sessionId: session._id,
        amount: amount,
        url: '/dashboard/earnings'
      },
      actionUrl: '/dashboard/earnings',
      actionText: 'View Earnings',
      priority: 'medium'
    });
  }

  static async notifyPaymentFailed(paymentData) {
    const { student, amount, session, reason } = paymentData;
    
    return this.createNotification({
      recipient: student._id,
      type: 'payment_failed',
      category: 'payment',
      title: 'Payment Failed',
      message: `Payment of $${amount} for your ${session.subject} session failed. ${reason ? `Reason: ${reason}` : 'Please update your payment method.'}`,
      data: {
        sessionId: session._id,
        amount: amount,
        url: '/settings/payment',
        metadata: { reason }
      },
      actionUrl: '/settings/payment',
      actionText: 'Update Payment',
      priority: 'urgent'
    });
  }

  // System notifications
  static async notifySystemAnnouncement(announcementData) {
    const { recipients, title, message, url, priority = 'medium' } = announcementData;
    
    const notifications = recipients.map(recipientId => 
      this.createNotification({
        recipient: recipientId,
        type: 'system_announcement',
        category: 'system',
        title: title,
        message: message,
        data: {
          url: url
        },
        actionUrl: url,
        actionText: 'Learn More',
        priority: priority,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })
    );

    return Promise.all(notifications);
  }

  // Video call notifications
  static async notifyVideoCallStarted(callData) {
    const { session, startedBy, participants } = callData;
    const otherParticipants = participants.filter(p => p._id.toString() !== startedBy._id.toString());
    
    const notifications = otherParticipants.map(participant =>
      this.createNotification({
        recipient: participant._id,
        sender: startedBy._id,
        type: 'video_call_started',
        category: 'session',
        title: 'Video Call Started',
        message: `${startedBy.firstName} ${startedBy.lastName} started the video call for your ${session.subject} session.`,
        data: {
          sessionId: session._id,
          url: `/sessions/${session._id}/video`
        },
        actionUrl: `/sessions/${session._id}/video`,
        actionText: 'Join Call',
        priority: 'urgent',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      })
    );

    return Promise.all(notifications);
  }

  // Cleanup old notifications
  static async cleanupOldNotifications() {
    try {
      const result = await Notification.deleteOldNotifications(30); // Delete notifications older than 30 days
      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
