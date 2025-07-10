const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Session = require('../models/Session');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixExistingReviews() {
  try {
    console.log('🔧 Starting review fix...');

    // Find all ratings that have missing or empty comments
    const ratingsToFix = await Rating.find({
      $or: [
        { comment: { $exists: false } },
        { comment: null },
        { comment: '' }
      ]
    }).populate('session');

    console.log(`Found ${ratingsToFix.length} ratings to fix`);

    for (const rating of ratingsToFix) {
      if (rating.session && rating.session.review) {
        // Copy the review from session to rating comment
        rating.comment = rating.session.review;
        await rating.save();
        console.log(`✅ Fixed rating ${rating._id} - added comment: "${rating.comment}"`);
      } else {
        // Set a default comment if no review exists
        rating.comment = 'Great session!';
        await rating.save();
        console.log(`✅ Fixed rating ${rating._id} - added default comment`);
      }
    }

    console.log('🎉 Review fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing reviews:', error);
    process.exit(1);
  }
}

fixExistingReviews();
