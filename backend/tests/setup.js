const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Set Jest default timeout for in-memory MongoDB initialization on Windows
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000);
}

const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  connectTestDB,
  closeTestDB,
  clearTestDB,
};
