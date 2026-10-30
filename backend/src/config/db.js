const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novelshelf';
  
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to prevent blocking if local mongod is not running
    });
    isConnected = true;
    console.log(`[Database] MongoDB successfully connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[Database] Notice: Direct MongoDB connection not active (${err.message}).`);
    console.log(`[Database] Activating integrated JSON-backed persistent archival storage engine (zero-dependency MERN mode).`);
  }
};

const getDbStatus = () => ({
  mode: isConnected ? 'mongodb' : 'persistent-file-engine',
  connected: isConnected,
  host: isConnected ? mongoose.connection.host : 'local-archival-store'
});

module.exports = { connectDB, getDbStatus };

