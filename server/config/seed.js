const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutormatch');
    console.log('📦 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  console.log('👤 Seeding users...');
  
  // Create super admin
  const admin = await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@tutormatch.com',
    password: 'Admin123!',
    role: 'admin',
    isActive: true,
    pendingApproval: false,
    profileCompleted: true,
    emailVerified: true,
    bio: 'Platform administrator with full access to all features.',
    city: 'New York',
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&size=300&background=4F46E5&color=fff'
  });
  
  // Create sample students
  const students = await User.create([
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      password: 'Student123!',
      role: 'student',
      isActive: true,
      profileCompleted: true,
      emailVerified: true,
      bio: 'Computer Science student looking for math and programming tutoring.',
      city: 'Boston',
      avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&size=300&background=10B981&color=fff'
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      password: 'Student123!',
      role: 'student',
      isActive: true,
      profileCompleted: true,
      emailVerified: true,
      bio: 'High school student preparing for SATs and college applications.',
      city: 'Chicago',
      avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&size=300&background=F59E0B&color=fff'
    },
    {
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol@example.com',
      password: 'Student123!',
      role: 'student',
      isActive: true,
      profileCompleted: true,
      emailVerified: true,
      bio: 'Graduate student seeking help with advanced mathematics and statistics.',
      city: 'San Francisco',
      avatar: 'https://ui-avatars.com/api/?name=Carol+Davis&size=300&background=EF4444&color=fff'
    }
  ]);
  
  // Create approved tutors
  const approvedTutors = await User.create([
    {
      firstName: 'Dr. Emily',
      lastName: 'Wilson',
      email: 'emily@example.com',
      password: 'Tutor123!',
      role: 'tutor',
      isActive: true,
      pendingApproval: false,
      profileCompleted: true,
      emailVerified: true,
      approvedAt: new Date(),
      approvedBy: admin._id,
      bio: 'PhD in Mathematics with 10+ years of teaching experience. Specializing in calculus, algebra, and statistics.',
      city: 'New York',
      subjects: ['Mathematics', 'Calculus', 'Algebra', 'Statistics'],
      qualifications: 'PhD in Mathematics from MIT, 10+ years teaching experience at university level',
      experience: 10,
      hourlyRate: 75,
      averageRating: 4.8,
      totalRatings: 24,
      avatar: 'https://ui-avatars.com/api/?name=Emily+Wilson&size=300&background=8B5CF6&color=fff',
      availability: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '15:00', available: true },
        saturday: { start: '10:00', end: '14:00', available: true },
        sunday: { available: false }
      }
    },
    {
      firstName: 'Prof. Michael',
      lastName: 'Chen',
      email: 'michael@example.com',
      password: 'Tutor123!',
      role: 'tutor',
      isActive: true,
      pendingApproval: false,
      profileCompleted: true,
      emailVerified: true,
      approvedAt: new Date(),
      approvedBy: admin._id,
      bio: 'Computer Science professor with expertise in programming, algorithms, and software development.',
      city: 'Seattle',
      subjects: ['Computer Science', 'Programming', 'Python', 'JavaScript', 'Algorithms'],
      qualifications: 'MS in Computer Science, 8 years industry experience, 5 years teaching',
      experience: 8,
      hourlyRate: 85,
      averageRating: 4.9,
      totalRatings: 31,
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&size=300&background=06B6D4&color=fff',
      availability: {
        monday: { start: '10:00', end: '18:00', available: true },
        tuesday: { start: '10:00', end: '18:00', available: true },
        wednesday: { start: '10:00', end: '18:00', available: true },
        thursday: { start: '10:00', end: '18:00', available: true },
        friday: { start: '10:00', end: '16:00', available: true },
        saturday: { available: false },
        sunday: { start: '12:00', end: '16:00', available: true }
      }
    },
    {
      firstName: 'Sarah',
      lastName: 'Martinez',
      email: 'sarah@example.com',
      password: 'Tutor123!',
      role: 'tutor',
      isActive: true,
      pendingApproval: false,
      profileCompleted: true,
      emailVerified: true,
      approvedAt: new Date(),
      approvedBy: admin._id,
      bio: 'Experienced language tutor specializing in Spanish and English as a Second Language.',
      city: 'Los Angeles',
      subjects: ['Spanish', 'English', 'ESL', 'Literature'],
      qualifications: 'BA in Spanish Literature, TESOL certification, 6 years tutoring experience',
      experience: 6,
      hourlyRate: 45,
      averageRating: 4.7,
      totalRatings: 18,
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Martinez&size=300&background=EC4899&color=fff',
      availability: {
        monday: { start: '08:00', end: '16:00', available: true },
        tuesday: { start: '08:00', end: '16:00', available: true },
        wednesday: { start: '08:00', end: '16:00', available: true },
        thursday: { start: '08:00', end: '16:00', available: true },
        friday: { start: '08:00', end: '14:00', available: true },
        saturday: { start: '09:00', end: '13:00', available: true },
        sunday: { available: false }
      }
    }
  ]);
  
  // Create pending tutors
  const pendingTutors = await User.create([
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@example.com',
      password: 'Tutor123!',
      role: 'tutor',
      isActive: true,
      pendingApproval: true,
      profileCompleted: true,
      emailVerified: true,
      bio: 'Recent PhD graduate in Physics looking to share knowledge through tutoring.',
      city: 'Austin',
      subjects: ['Physics', 'Mathematics', 'Chemistry'],
      qualifications: 'PhD in Physics from UT Austin, 3 years TA experience',
      experience: 3,
      hourlyRate: 60,
      avatar: 'https://ui-avatars.com/api/?name=David+Brown&size=300&background=84CC16&color=fff'
    },
    {
      firstName: 'Lisa',
      lastName: 'Taylor',
      email: 'lisa@example.com',
      password: 'Tutor123!',
      role: 'tutor',
      isActive: true,
      pendingApproval: true,
      profileCompleted: true,
      emailVerified: true,
      bio: 'Certified teacher with expertise in elementary and middle school subjects.',
      city: 'Denver',
      subjects: ['Elementary Math', 'Reading', 'Science', 'Social Studies'],
      qualifications: 'BS in Elementary Education, State Teaching Certification, 4 years classroom experience',
      experience: 4,
      hourlyRate: 35,
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Taylor&size=300&background=F97316&color=fff'
    }
  ]);
  
  console.log(`✅ Created ${1} admin, ${students.length} students, ${approvedTutors.length} approved tutors, ${pendingTutors.length} pending tutors`);
  
  return { admin, students, approvedTutors, pendingTutors };
};

const seedSessions = async (users) => {
  console.log('📚 Seeding sessions...');
  
  const { students, approvedTutors } = users;
  
  const sessions = await Session.create([
    {
      student: students[0]._id,
      tutor: approvedTutors[0]._id,
      subject: 'Calculus',
      description: 'Help with derivatives and integrals',
      sessionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      startTime: '14:00',
      endTime: '15:00',
      duration: 1,
      status: 'approved',
      hourlyRate: 75,
      totalCost: 75,
      studentMessage: 'I need help understanding derivatives for my upcoming exam.',
      tutorResponse: 'I\'d be happy to help! We\'ll cover the fundamentals and work through practice problems.'
    },
    {
      student: students[1]._id,
      tutor: approvedTutors[1]._id,
      subject: 'Python Programming',
      description: 'Introduction to Python basics',
      preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      duration: 90,
      status: 'approved',
      hourlyRate: 85,
      totalAmount: 127.5,
      studentMessage: 'Complete beginner looking to learn Python for data analysis.',
      tutorResponse: 'Perfect! We\'ll start with the basics and build up to data analysis libraries.'
    },
    {
      student: students[2]._id,
      tutor: approvedTutors[2]._id,
      subject: 'Spanish Conversation',
      description: 'Practice conversational Spanish',
      preferredDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 60,
      status: 'completed',
      hourlyRate: 45,
      totalAmount: 45,
      sessionStartTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      sessionEndTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      actualDuration: 60,
      studentMessage: 'Want to improve my conversational Spanish for travel.',
      tutorResponse: 'Great! We\'ll focus on practical phrases and conversation practice.',
      isRated: true
    },
    {
      student: students[0]._id,
      tutor: approvedTutors[1]._id,
      subject: 'JavaScript',
      description: 'Web development fundamentals',
      sessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      startTime: '10:00',
      endTime: '12:00',
      duration: 2,
      status: 'pending',
      hourlyRate: 85,
      totalCost: 170,
      studentMessage: 'Need help building my first web application with JavaScript.'
    }
  ]);
  
  console.log(`✅ Created ${sessions.length} sessions`);
  return sessions;
};

const seedRatings = async (users, sessions) => {
  console.log('⭐ Seeding ratings...');
  
  const { students } = users;
  const completedSession = sessions.find(s => s.status === 'completed');
  
  if (completedSession) {
    const rating = await Rating.create({
      session: completedSession._id,
      student: completedSession.student,
      tutor: completedSession.tutor,
      rating: 5,
      comment: 'Excellent session! Sarah was very patient and helped me improve my pronunciation significantly.',
      subject: completedSession.subject,
      sessionDuration: completedSession.duration,
      sessionDate: completedSession.sessionEndTime
    });
    
    console.log(`✅ Created 1 rating`);
    return [rating];
  }
  
  return [];
};

const seedNotifications = async (users) => {
  console.log('🔔 Seeding notifications...');
  
  const { admin, students, approvedTutors, pendingTutors } = users;
  
  const notifications = await Notification.create([
    {
      recipient: pendingTutors[0]._id,
      title: 'Application Under Review',
      message: 'Your tutor application is currently being reviewed by our team. We\'ll notify you once a decision is made.',
      type: 'general',
      category: 'account',
      priority: 'medium'
    },
    {
      recipient: students[0]._id,
      title: 'Session Approved',
      message: 'Your calculus session with Dr. Emily Wilson has been approved!',
      type: 'session_approved',
      category: 'session',
      priority: 'high',
      actionUrl: '/sessions',
      actionText: 'View Session'
    },
    {
      recipient: approvedTutors[0]._id,
      title: 'New Session Request',
      message: 'You have a new session request for JavaScript from Alice Johnson.',
      type: 'session_request',
      category: 'session',
      priority: 'medium',
      actionUrl: '/sessions/pending',
      actionText: 'Review Request'
    }
  ]);
  
  console.log(`✅ Created ${notifications.length} notifications`);
  return notifications;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Session.deleteMany({});
    await Rating.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('🌱 Starting database seeding...');
    
    const users = await seedUsers();
    const sessions = await seedSessions(users);
    const ratings = await seedRatings(users, sessions);
    const notifications = await seedNotifications(users);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👑 Admin: admin@tutormatch.com / Admin123!');
    console.log('👨‍🎓 Student: alice@example.com / Student123!');
    console.log('👨‍🏫 Tutor: emily@example.com / Tutor123!');
    console.log('⏳ Pending Tutor: david@example.com / Tutor123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
