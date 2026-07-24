const mongoose = require('mongoose');

const connectDB = async () => {
  const localURI = 'mongodb://localhost:27017/parampara';
  const remoteURI = process.env.MONGO_URI;

  if (remoteURI) {
    try {
      console.log('Connecting to remote MongoDB Atlas...');
      const conn = await mongoose.connect(remoteURI, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected (Remote): ${conn.connection.host} ✓`);
      return;
    } catch (err) {
      console.warn(`Remote MongoDB connection failed: ${err.message}. Trying local fallback...`);
    }
  }

  try {
    console.log(`Connecting to local MongoDB at ${localURI}...`);
    const conn = await mongoose.connect(localURI, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected (Local): ${conn.connection.host} ✓`);
  } catch (err) {
    console.error(`⚠️ Database Connection Warning: Both remote and local MongoDB connections failed. Express server will run in offline mode.`);
  }
};

module.exports = connectDB;
