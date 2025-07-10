const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Message = require('../models/Message');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
require('dotenv').config();

// Sample data
const sampleUsers = [
  // Admin
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@tutormatch.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  
  // Tutors
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    password: 'password123',
    role: 'tutor',
    isVerified: true,
    isActive: true,
    profileCompleted: true,
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Experienced mathematics tutor with 8+ years of teaching experience. Specialized in calculus, algebra, and statistics.',
    subjects: ['Mathematics', 'Statistics', 'Calculus'],
    hourlyRate: 45,
    qualifications: 'PhD in Mathematics, Stanford University',
    experience: 8,
    city: 'San Francisco',
    state: 'CA',
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '15:00' }]
    },
    pendingApproval: false,
    approvedAt: new Date(),
    approvedBy: null
  },
  
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    password: 'password123',
    role: 'tutor',
    isVerified: true,
    isActive: true,
    profileCompleted: true,
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Computer Science expert with industry experience at Google and Microsoft. Teaching programming, algorithms, and web development.',
    subjects: ['Computer Science', 'Programming', 'Web Development', 'JavaScript', 'Python'],
    hourlyRate: 60,
    qualifications: 'MS Computer Science, MIT',
    experience: 8,
    city: 'Seattle',
    state: 'WA',
    availability: {
      monday: [{ start: '18:00', end: '22:00' }],
      tuesday: [{ start: '18:00', end: '22:00' }],
      wednesday: [{ start: '18:00', end: '22:00' }],
      thursday: [{ start: '18:00', end: '22:00' }],
      saturday: [{ start: '10:00', end: '16:00' }]
    },
    pendingApproval: false,
    approvedAt: new Date(),
    approvedBy: null
  },

  {
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    password: 'password123',
    role: 'tutor',
    isVerified: true,
    isActive: true,
    profileCompleted: true,
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Native Spanish speaker and certified language instructor. Helping students achieve fluency through immersive conversation practice.',
    subjects: ['Spanish', 'French', 'Language Arts'],
    hourlyRate: 35,
    qualifications: 'BA in Linguistics, University of Barcelona',
    experience: 6,
    city: 'Los Angeles',
    state: 'CA',
    availability: {
      monday: [{ start: '14:00', end: '20:00' }],
      wednesday: [{ start: '14:00', end: '20:00' }],
      friday: [{ start: '14:00', end: '20:00' }],
      saturday: [{ start: '09:00', end: '15:00' }],
      sunday: [{ start: '09:00', end: '15:00' }]
    },
    pendingApproval: false,
    approvedAt: new Date(),
    approvedBy: null
  },

  {
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@email.com',
    password: 'password123',
    role: 'tutor',
    isVerified: true,
    isActive: true,
    profileCompleted: true,
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'Physics PhD with a passion for making complex concepts accessible. Specializing in mechanics, thermodynamics, and quantum physics.',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    hourlyRate: 50,
    qualifications: 'PhD in Physics, Caltech',
    experience: 10,
    city: 'Boston',
    state: 'MA',
    availability: {
      tuesday: [{ start: '10:00', end: '16:00' }],
      thursday: [{ start: '10:00', end: '16:00' }],
      saturday: [{ start: '08:00', end: '14:00' }]
    },
    pendingApproval: false,
    approvedAt: new Date(),
    approvedBy: null
  },

  {
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@email.com',
    password: 'password123',
    role: 'tutor',
    isVerified: true,
    isActive: true,
    profileCompleted: true,
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    bio: 'Experienced English literature teacher with expertise in essay writing, reading comprehension, and literary analysis.',
    subjects: ['English', 'Literature', 'Writing', 'Reading Comprehension'],
    hourlyRate: 40,
    qualifications: 'MA in English Literature, Harvard University',
    experience: 7,
    city: 'New York',
    state: 'NY',
    availability: {
      monday: [{ start: '16:00', end: '20:00' }],
      tuesday: [{ start: '16:00', end: '20:00' }],
      wednesday: [{ start: '16:00', end: '20:00' }],
      thursday: [{ start: '16:00', end: '20:00' }],
      sunday: [{ start: '10:00', end: '16:00' }]
    },
    pendingApproval: false,
    approvedAt: new Date(),
    approvedBy: null
  },

  // Students
  {
    firstName: 'Alex',
    lastName: 'Smith',
    email: 'alex.smith@email.com',
    password: 'password123',
    role: 'student',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    bio: 'High school senior preparing for college entrance exams. Looking for help with calculus and physics.',
    grade: '12th Grade'
  },
  
  {
    firstName: 'Jessica',
    lastName: 'Brown',
    email: 'jessica.brown@email.com',
    password: 'password123',
    role: 'student',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    bio: 'College freshman studying computer science. Need help with programming fundamentals and data structures.',
    grade: 'College Freshman'
  },
  
  {
    firstName: 'Ryan',
    lastName: 'Davis',
    email: 'ryan.davis@email.com',
    password: 'password123',
    role: 'student',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    bio: 'Working professional looking to improve Spanish language skills for career advancement.',
    grade: 'Adult Learner'
  },
  
  {
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@email.com',
    password: 'password123',
    role: 'student',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    bio: 'Graduate student in literature program. Seeking advanced writing and research assistance.',
    grade: 'Graduate Student'
  },
  
  {
    firstName: 'James',
    lastName: 'Miller',
    email: 'james.miller@email.com',
    password: 'password123',
    role: 'student',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
    bio: 'Middle school student struggling with algebra. Looking for patient tutor to build confidence.',
    grade: '8th Grade'
  }
];

const sampleSessions = [
  {
    subject: 'Calculus',
    description: 'Help with derivatives and integrals for upcoming exam',
    sessionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    startTime: '14:00',
    endTime: '15:00',
    duration: 1,
    status: 'approved',
    sessionType: 'online',
    hourlyRate: 45,
    totalCost: 45
  },
  {
    subject: 'JavaScript',
    description: 'Learn React fundamentals and component lifecycle',
    sessionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    startTime: '16:00',
    endTime: '17:30',
    duration: 1.5,
    status: 'pending',
    sessionType: 'online',
    hourlyRate: 60,
    totalCost: 90
  },
  {
    subject: 'Spanish Conversation',
    description: 'Practice conversational Spanish for travel',
    sessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    startTime: '10:00',
    endTime: '10:45',
    duration: 0.75,
    status: 'approved',
    sessionType: 'online',
    hourlyRate: 35,
    totalCost: 26.25
  }
];

const sampleRatings = [
  {
    rating: 5,
    comment: 'Excellent tutor! Sarah explained calculus concepts very clearly and was very patient with my questions.',
    subject: 'Calculus'
  },
  {
    rating: 4,
    comment: 'Michael is very knowledgeable about programming. The session was helpful but could have been more structured.',
    subject: 'JavaScript'
  },
  {
    rating: 5,
    comment: 'Emily made learning Spanish fun and engaging. I feel much more confident speaking now!',
    subject: 'Spanish Conversation'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutormatch');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Session.deleteMany({});
    await Message.deleteMany({});
    await Rating.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create users (password will be hashed by pre-save hook)
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.firstName} ${user.lastName} (${user.role})`);
    }

    // Get specific users for creating relationships
    const admin = users.find(u => u.role === 'admin');
    const tutors = users.filter(u => u.role === 'tutor');
    const students = users.filter(u => u.role === 'student');

    // Create sessions
    const sessions = [];
    for (let i = 0; i < sampleSessions.length; i++) {
      const sessionData = sampleSessions[i];
      const tutor = tutors[i % tutors.length];
      const student = students[i % students.length];
      
      const session = new Session({
        ...sessionData,
        tutor: tutor._id,
        student: student._id
      });
      await session.save();
      sessions.push(session);
      console.log(`Created session: ${session.subject} between ${tutor.firstName} and ${student.firstName}`);
    }

    // Create ratings
    for (let i = 0; i < sampleRatings.length; i++) {
      const ratingData = sampleRatings[i];
      const session = sessions[i];
      
      if (session) {
        const rating = new Rating({
          ...ratingData,
          tutor: session.tutor,
          student: session.student,
          session: session._id
        });
        await rating.save();
        console.log(`Created rating: ${rating.rating} stars for ${ratingData.sessionSubject}`);
      }
    }

    // Create sample messages
    const sampleMessages = [
      {
        session: sessions[0]._id,
        sender: sessions[0].student,
        receiver: sessions[0].tutor,
        content: 'Hi Sarah! Looking forward to our calculus session tomorrow.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        session: sessions[0]._id,
        sender: sessions[0].tutor,
        receiver: sessions[0].student,
        content: 'Hello Alex! I\'m excited to help you with calculus. Do you have any specific topics you\'d like to focus on?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        session: sessions[1]._id,
        sender: sessions[1].student,
        receiver: sessions[1].tutor,
        content: 'Hi Michael! I\'m new to React and would love to understand the basics.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ];

    for (const messageData of sampleMessages) {
      const message = new Message(messageData);
      await message.save();
      console.log(`Created message in session ${messageData.session}`);
    }

    // Create sample notifications
    const sampleNotifications = [
      {
        recipient: students[0]._id,
        sender: tutors[0]._id,
        type: 'session_approved',
        category: 'session',
        title: 'Session Approved!',
        message: 'Your calculus session with Sarah Johnson has been approved.',
        data: {
          sessionId: sessions[0]._id,
          url: `/sessions/${sessions[0]._id}`
        },
        actionUrl: `/sessions/${sessions[0]._id}`,
        actionText: 'View Session',
        priority: 'high'
      },
      {
        recipient: tutors[1]._id,
        sender: students[1]._id,
        type: 'session_request',
        category: 'session',
        title: 'New Session Request',
        message: 'Jessica Brown has requested a JavaScript session.',
        data: {
          sessionId: sessions[1]._id,
          url: `/sessions/${sessions[1]._id}`
        },
        actionRequired: true,
        actionUrl: `/sessions/${sessions[1]._id}`,
        actionText: 'View Request',
        priority: 'high'
      }
    ];

    for (const notificationData of sampleNotifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`Created notification: ${notification.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length} (1 admin, ${tutors.length} tutors, ${students.length} students)`);
    console.log(`📚 Sessions: ${sessions.length}`);
    console.log(`⭐ Ratings: ${sampleRatings.length}`);
    console.log(`💬 Messages: ${sampleMessages.length}`);
    console.log(`🔔 Notifications: ${sampleNotifications.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@tutormatch.com / admin123');
    console.log('Tutor: sarah.johnson@email.com / password123');
    console.log('Student: alex.smith@email.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seed script
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
