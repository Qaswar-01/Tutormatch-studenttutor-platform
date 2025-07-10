const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutormatch', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Generate 40 student users
const generateStudents = async () => {
  // Starting names as requested
  const baseNames = [
    { firstName: 'Muhammad', lastName: 'Qaswar' },
    { firstName: 'Muhammad', lastName: 'Ahsan' },
    { firstName: 'Muhammad', lastName: 'Adil' },
    { firstName: 'Muhammad', lastName: 'Irfan' },
    { firstName: 'Muhammad', lastName: 'Sufyan' },
  ];

  // Additional 35 realistic names
  const additionalNames = [
    { firstName: 'Muhammad', lastName: 'Hassan' },
    { firstName: 'Muhammad', lastName: 'Ali' },
    { firstName: 'Muhammad', lastName: 'Ahmad' },
    { firstName: 'Muhammad', lastName: 'Usman' },
    { firstName: 'Muhammad', lastName: 'Bilal' },
    { firstName: 'Muhammad', lastName: 'Faisal' },
    { firstName: 'Muhammad', lastName: 'Zain' },
    { firstName: 'Muhammad', lastName: 'Hamza' },
    { firstName: 'Muhammad', lastName: 'Talha' },
    { firstName: 'Muhammad', lastName: 'Saad' },
    { firstName: 'Muhammad', lastName: 'Waqas' },
    { firstName: 'Muhammad', lastName: 'Asad' },
    { firstName: 'Muhammad', lastName: 'Farhan' },
    { firstName: 'Muhammad', lastName: 'Kashif' },
    { firstName: 'Muhammad', lastName: 'Shahid' },
    { firstName: 'Muhammad', lastName: 'Tariq' },
    { firstName: 'Muhammad', lastName: 'Salman' },
    { firstName: 'Muhammad', lastName: 'Imran' },
    { firstName: 'Muhammad', lastName: 'Rizwan' },
    { firstName: 'Muhammad', lastName: 'Junaid' },
    { firstName: 'Ahmed', lastName: 'Khan' },
    { firstName: 'Ali', lastName: 'Ahmed' },
    { firstName: 'Hassan', lastName: 'Ali' },
    { firstName: 'Usman', lastName: 'Sheikh' },
    { firstName: 'Bilal', lastName: 'Ahmad' },
    { firstName: 'Faisal', lastName: 'Malik' },
    { firstName: 'Zain', lastName: 'Abbas' },
    { firstName: 'Hamza', lastName: 'Hussain' },
    { firstName: 'Talha', lastName: 'Iqbal' },
    { firstName: 'Saad', lastName: 'Rahman' },
    { firstName: 'Waqas', lastName: 'Siddique' },
    { firstName: 'Asad', lastName: 'Nawaz' },
    { firstName: 'Farhan', lastName: 'Chaudhry' },
    { firstName: 'Kashif', lastName: 'Butt' },
    { firstName: 'Shahid', lastName: 'Dar' }
  ];

  // Combine all names (first 5 + additional 35 = 40 total)
  const allNames = [...baseNames, ...additionalNames];

  // Hash the default password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Generate student data
  const students = allNames.map((name, index) => {
    // Create email from first name (lowercase) + number + @example.com
    const emailName = name.firstName.toLowerCase().replace('muhammad', 'muhammad');
    const email = `${emailName}${index + 1}@example.com`;

    return {
      firstName: name.firstName,
      lastName: name.lastName,
      email: email,
      password: hashedPassword,
      role: 'student',
      isActive: true,
      pendingApproval: false,
      profileCompleted: true,
      emailVerified: true,
      city: 'Lahore',
      country: 'Pakistan',
      bio: `I'm ${name.firstName} ${name.lastName}, a dedicated student looking to improve my academic performance through personalized tutoring.`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  return students;
};

// Main seeding function
const seedStudents = async () => {
  try {
    console.log('🌱 Starting student seeding process...');
    
    // Connect to database
    await connectDB();
    
    // Check if students already exist
    const existingStudentsCount = await User.countDocuments({ role: 'student' });
    console.log(`📊 Found ${existingStudentsCount} existing students in database`);
    
    // Generate student data
    const students = await generateStudents();
    console.log(`📝 Generated ${students.length} student records`);
    
    // Insert students into database
    const insertedStudents = await User.insertMany(students);
    console.log(`✅ Successfully inserted ${insertedStudents.length} students into database`);
    
    // Display some sample data
    console.log('\n📋 Sample inserted students:');
    insertedStudents.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName} - ${student.email}`);
    });
    
    console.log('\n🎉 Student seeding completed successfully!');
    console.log(`📈 Total students in database: ${existingStudentsCount + insertedStudents.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding students:', error.message);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error('💡 Some emails already exist in database. Consider using different email patterns.');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
if (require.main === module) {
  seedStudents();
}

module.exports = { seedStudents, generateStudents };
