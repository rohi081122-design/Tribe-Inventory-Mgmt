const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require('mongoose');

// If the first connection attempt fails we try again after this many milliseconds
const RETRY_DELAY_MS = 10000;

// Returns true while Mongoose has an open connection to MongoDB
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

// Turns low-level MongoDB errors into hints a beginner can act on
function explainConnectionError(error) {
  const message = error.message || '';

  if (message.includes('bad auth') || message.includes('Authentication failed')) {
    return 'Wrong database username or password inside MONGO_URI. Check the Database Access page in MongoDB Atlas.';
  }
  if (message.includes('ENOTFOUND') || message.includes('querySrv')) {
    return 'The cluster address in MONGO_URI could not be found. Check for typos and make sure you are online.';
  }
  if (message.includes('ECONNREFUSED')) {
    return 'Nothing is listening at that address. If you use a local MongoDB, make sure the MongoDB service is running.';
  }
  if (message.includes('Invalid scheme') || message.includes('Invalid connection string')) {
    return 'MONGO_URI must start with mongodb:// or mongodb+srv://';
  }
  if (error.name === 'MongooseServerSelectionError' || message.includes('timed out')) {
    return 'Could not reach MongoDB in time. In MongoDB Atlas open "Network Access" and allow your current IP address.';
  }
  return message;
}

// Connects to MongoDB. "onConnected" runs once the connection is ready.
async function connectDB(onConnected) {
  const uri = process.env.MONGO_URI;

  // Stop early with a clear message when the placeholder was not replaced
  if (!uri || uri.startsWith('PASTE_')) {
    console.error('\n❌ MONGO_URI is not set.');
    console.error('   Open backend/.env and paste your MongoDB connection string after MONGO_URI=');
    console.error('   (Create backend/.env by copying backend/.env.example if it does not exist.)\n');
    return;
  }

  try {
    const connection = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅ MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
  } catch (error) {
    console.error('\n❌ MongoDB connection failed.');
    console.error(`   Reason: ${explainConnectionError(error)}`);
    console.error(`   Trying again in ${RETRY_DELAY_MS / 1000} seconds...\n`);
    setTimeout(() => connectDB(onConnected), RETRY_DELAY_MS);
    return;
  }

  // Runs after a successful connection (for example: creating the default categories)
  if (onConnected) {
    try {
      await onConnected();
    } catch (error) {
      console.error('⚠️  Connected to MongoDB, but the startup task failed:', error.message);
    }
  }
}

module.exports = { connectDB, isDatabaseConnected };
