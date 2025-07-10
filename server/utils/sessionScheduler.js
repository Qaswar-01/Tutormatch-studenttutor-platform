const Session = require('../models/Session');
const User = require('../models/User');

// Check if a time slot is available for a tutor
const isTimeSlotAvailable = async (tutorId, date, startTime, endTime, excludeSessionId = null) => {
  try {
    const query = {
      tutor: tutorId,
      sessionDate: new Date(date),
      status: { $in: ['pending', 'approved', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    };

    // Exclude a specific session (useful for rescheduling)
    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
    }

    const conflictingSession = await Session.findOne(query);
    return !conflictingSession;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return false;
  }
};

// Get available time slots for a tutor on a specific date
const getAvailableTimeSlots = async (tutorId, date, duration = 1) => {
  try {
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      throw new Error('Tutor not found');
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Get tutor's availability for this day
    const dayAvailability = tutor.availability?.[dayOfWeek];
    
    if (!dayAvailability?.available) {
      return [];
    }

    // Get existing sessions for this date
    const existingSessions = await Session.find({
      tutor: tutorId,
      sessionDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'approved', 'in-progress'] }
    }).select('startTime endTime').sort({ startTime: 1 });

    // Parse availability times
    const [startHour, startMinute] = dayAvailability.start.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.end.split(':').map(Number);

    const availableSlots = [];
    const slotDurationMs = duration * 60 * 60 * 1000; // Convert hours to milliseconds

    // Generate time slots
    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime.getTime() + slotDurationMs <= endTime.getTime()) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEndTime = new Date(currentTime.getTime() + slotDurationMs);
      const slotEnd = slotEndTime.toTimeString().slice(0, 5);

      // Check if this slot conflicts with existing sessions
      const hasConflict = existingSessions.some(session => {
        return (slotStart < session.endTime && slotEnd > session.startTime);
      });

      if (!hasConflict) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          duration: duration
        });
      }

      // Move to next slot (30-minute intervals)
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
};

// Find optimal time slots across multiple days
const findOptimalTimeSlots = async (tutorId, startDate, endDate, duration = 1, maxResults = 10) => {
  try {
    const slots = [];
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate && slots.length < maxResults) {
      const dateString = currentDate.toISOString().split('T')[0];
      const daySlots = await getAvailableTimeSlots(tutorId, dateString, duration);
      
      daySlots.forEach(slot => {
        slots.push({
          date: dateString,
          ...slot
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots.slice(0, maxResults);
  } catch (error) {
    console.error('Error finding optimal time slots:', error);
    return [];
  }
};

// Calculate session statistics for a tutor
const calculateTutorSessionStats = async (tutorId, startDate = null, endDate = null) => {
  try {
    const query = { tutor: tutorId };
    
    if (startDate && endDate) {
      query.sessionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Session.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShowSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
          },
          totalEarnings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$totalCost', 0] }
          },
          totalHours: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$duration', 0] }
          },
          averageRating: { $avg: '$rating' },
          subjectBreakdown: { $push: '$subject' }
        }
      }
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      noShowSessions: 0,
      totalEarnings: 0,
      totalHours: 0,
      averageRating: 0,
      subjectBreakdown: []
    };

    // Calculate completion rate
    result.completionRate = result.totalSessions > 0 
      ? (result.completedSessions / result.totalSessions * 100).toFixed(1)
      : 0;

    // Calculate subject distribution
    const subjectCounts = {};
    result.subjectBreakdown.forEach(subject => {
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    result.subjectDistribution = subjectCounts;
    delete result.subjectBreakdown;

    return result;
  } catch (error) {
    console.error('Error calculating tutor session stats:', error);
    return null;
  }
};

// Get tutor's busy hours for analytics
const getTutorBusyHours = async (tutorId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await Session.find({
      tutor: tutorId,
      sessionDate: { $gte: startDate },
      status: { $in: ['completed', 'in-progress'] }
    }).select('startTime endTime sessionDate');

    const hourCounts = {};
    
    sessions.forEach(session => {
      const startHour = parseInt(session.startTime.split(':')[0]);
      const endHour = parseInt(session.endTime.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // Convert to array format for easier frontend consumption
    const busyHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessionCount: hourCounts[hour] || 0,
      label: `${hour.toString().padStart(2, '0')}:00`
    }));

    return busyHours;
  } catch (error) {
    console.error('Error getting tutor busy hours:', error);
    return [];
  }
};

// Suggest optimal pricing based on demand
const suggestOptimalPricing = async (tutorId, subject) => {
  try {
    // Get average pricing for similar tutors
    const similarTutors = await User.find({
      role: 'tutor',
      subjects: subject,
      _id: { $ne: tutorId },
      hourlyRate: { $exists: true, $gt: 0 }
    }).select('hourlyRate experience averageRating');

    if (similarTutors.length === 0) {
      return { suggested: null, message: 'Not enough data for pricing suggestion' };
    }

    // Calculate market rates
    const rates = similarTutors.map(t => t.hourlyRate);
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    // Get tutor's current stats
    const tutorStats = await calculateTutorSessionStats(tutorId);
    const tutor = await User.findById(tutorId);

    let suggestedRate = avgRate;

    // Adjust based on experience
    if (tutor.experience > 5) {
      suggestedRate *= 1.1; // 10% premium for experienced tutors
    }

    // Adjust based on rating
    if (tutor.averageRating > 4.5) {
      suggestedRate *= 1.05; // 5% premium for highly rated tutors
    }

    // Adjust based on completion rate
    if (tutorStats && tutorStats.completionRate > 90) {
      suggestedRate *= 1.03; // 3% premium for reliable tutors
    }

    return {
      suggested: Math.round(suggestedRate * 100) / 100,
      market: {
        average: Math.round(avgRate * 100) / 100,
        min: minRate,
        max: maxRate,
        sampleSize: similarTutors.length
      },
      factors: {
        experience: tutor.experience,
        rating: tutor.averageRating,
        completionRate: tutorStats?.completionRate || 0
      }
    };
  } catch (error) {
    console.error('Error suggesting optimal pricing:', error);
    return { suggested: null, message: 'Error calculating pricing suggestion' };
  }
};

module.exports = {
  isTimeSlotAvailable,
  getAvailableTimeSlots,
  findOptimalTimeSlots,
  calculateTutorSessionStats,
  getTutorBusyHours,
  suggestOptimalPricing
};
