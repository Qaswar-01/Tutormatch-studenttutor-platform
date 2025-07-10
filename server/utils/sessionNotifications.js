const Notification = require('../models/Notification');

// Create notification for session events
const createSessionNotification = async (type, session, recipient, data = {}) => {
  try {
    let title, message, actionUrl;

    switch (type) {
      case 'session_requested':
        title = 'New Session Request';
        message = `${session.student.firstName} ${session.student.lastName} has requested a ${session.subject} session`;
        actionUrl = `/sessions/${session._id}`;
        break;

      case 'session_approved':
        title = 'Session Approved';
        message = `Your ${session.subject} session with ${session.tutor.firstName} ${session.tutor.lastName} has been approved`;
        actionUrl = `/sessions/${session._id}`;
        break;

      case 'session_rejected':
        title = 'Session Rejected';
        message = `Your ${session.subject} session request has been rejected`;
        actionUrl = `/sessions/${session._id}`;
        break;

      case 'session_cancelled':
        title = 'Session Cancelled';
        message = `Your ${session.subject} session has been cancelled`;
        actionUrl = `/sessions/${session._id}`;
        break;

      case 'session_rescheduled':
        title = 'Session Rescheduled';
        message = `Your ${session.subject} session has been rescheduled`;
        actionUrl = `/sessions/${session._id}`;
        break;

      case 'session_starting_soon':
        title = 'Session Starting Soon';
        message = `Your ${session.subject} session starts in 15 minutes`;
        actionUrl = `/sessions/${session._id}`;
        break;

      case 'session_completed':
        title = 'Session Completed';
        message = `Your ${session.subject} session has been completed. Please rate your experience`;
        actionUrl = `/sessions/${session._id}`;
        break;

      case 'session_rated':
        title = 'Session Rated';
        message = `${session.student.firstName} ${session.student.lastName} has rated your session`;
        actionUrl = `/sessions/${session._id}`;
        break;

      default:
        console.warn(`Unknown notification type: ${type}`);
        return null;
    }

    const notification = new Notification({
      recipient,
      type: 'session',
      title,
      message,
      actionUrl,
      metadata: {
        sessionId: session._id,
        sessionType: type,
        ...data
      }
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating session notification:', error);
    return null;
  }
};

// Send session reminder notifications
const sendSessionReminders = async () => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    // Find sessions starting in 15 minutes
    const upcomingSessions = await Session.find({
      sessionDate: {
        $gte: now,
        $lte: reminderTime
      },
      status: 'approved',
      reminderSent: { $ne: true }
    })
    .populate('student', 'firstName lastName')
    .populate('tutor', 'firstName lastName');

    for (const session of upcomingSessions) {
      // Send reminder to student
      await createSessionNotification(
        'session_starting_soon',
        session,
        session.student._id
      );

      // Send reminder to tutor
      await createSessionNotification(
        'session_starting_soon',
        session,
        session.tutor._id
      );

      // Mark reminder as sent
      session.reminderSent = true;
      await session.save();
    }

    console.log(`Sent reminders for ${upcomingSessions.length} sessions`);
  } catch (error) {
    console.error('Error sending session reminders:', error);
  }
};

// Check for overdue sessions and mark them as no-show
const checkOverdueSessions = async () => {
  try {
    const now = new Date();
    const overdueTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

    const overdueSessions = await Session.find({
      sessionDate: { $lte: overdueTime },
      status: 'approved'
    });

    for (const session of overdueSessions) {
      session.status = 'no-show';
      session.noShowAt = now;
      await session.save();

      console.log(`Marked session ${session._id} as no-show`);
    }

    console.log(`Marked ${overdueSessions.length} sessions as no-show`);
  } catch (error) {
    console.error('Error checking overdue sessions:', error);
  }
};

// Auto-complete sessions that are past their end time
const autoCompleteSessions = async () => {
  try {
    const now = new Date();

    const sessionsToComplete = await Session.find({
      status: 'in-progress'
    })
    .populate('student', 'firstName lastName')
    .populate('tutor', 'firstName lastName');

    for (const session of sessionsToComplete) {
      const sessionEndTime = new Date(`${session.sessionDate.toISOString().split('T')[0]}T${session.endTime}`);
      
      // If session end time has passed, auto-complete it
      if (sessionEndTime <= now) {
        session.status = 'completed';
        session.completedAt = now;
        await session.save();

        // Notify student to rate the session
        await createSessionNotification(
          'session_completed',
          session,
          session.student._id
        );

        console.log(`Auto-completed session ${session._id}`);
      }
    }
  } catch (error) {
    console.error('Error auto-completing sessions:', error);
  }
};

// Get session notification preferences
const getNotificationPreferences = async (userId) => {
  try {
    const user = await User.findById(userId).select('notificationPreferences');
    return user?.notificationPreferences || {
      sessionRequests: true,
      sessionUpdates: true,
      sessionReminders: true,
      sessionRatings: true
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return {
      sessionRequests: true,
      sessionUpdates: true,
      sessionReminders: true,
      sessionRatings: true
    };
  }
};

// Send email notification (placeholder for email service integration)
const sendEmailNotification = async (recipient, subject, template, data) => {
  try {
    // This would integrate with an email service like SendGrid, Mailgun, etc.
    console.log(`Email notification sent to ${recipient}: ${subject}`);
    
    // For now, just log the notification
    // In production, you would implement actual email sending here
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Batch notification sender for efficiency
const sendBatchNotifications = async (notifications) => {
  try {
    const results = await Promise.allSettled(
      notifications.map(notification => 
        createSessionNotification(
          notification.type,
          notification.session,
          notification.recipient,
          notification.data
        )
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Batch notifications: ${successful} successful, ${failed} failed`);
    
    return { successful, failed };
  } catch (error) {
    console.error('Error sending batch notifications:', error);
    return { successful: 0, failed: notifications.length };
  }
};

module.exports = {
  createSessionNotification,
  sendSessionReminders,
  checkOverdueSessions,
  autoCompleteSessions,
  getNotificationPreferences,
  sendEmailNotification,
  sendBatchNotifications
};
