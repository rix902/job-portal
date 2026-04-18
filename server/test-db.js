const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const testConnection = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';
  
  console.log('--- Database Connection Test ---');
  console.log(`Attempting to connect to: ${uri}`);

  try {
    // Attempt connection
    await mongoose.connect(uri);
    
    // Check state
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    console.log(`Success! Current state: ${states[state]} (${state})`);
    
    // Optional: Try a simple ping or check collection count
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Connected to database: ${mongoose.connection.name}`);
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);

    // Close connection
    await mongoose.disconnect();
    console.log('Connection closed gracefully.');
    console.log('-------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('FAILED to connect to MongoDB!');
    console.error('Error Details:', err.message);
    console.log('-------------------------------');
    process.exit(1);
  }
};

testConnection();
