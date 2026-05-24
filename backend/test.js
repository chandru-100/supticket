const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * SupTicket Test Script
 * 
 * You can use this file to quickly test backend logic, database connections, 
 * or models without needing to run the full Express server.
 * 
 * Run this file using: node test.js
 */

const runTests = async () => {
  try {
    console.log('⏳ Starting tests...');

    const User = require('./models/User');
    
    console.log('🔄 Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');

    console.log('🔄 Making all current users admins...');
    await User.updateMany({}, { role: 'admin' });
    const users = await User.find({}).select('name email role');
    console.log('👥 Users in DB:');
    users.forEach(u => console.log(`- ${u.name} | ${u.email} | Role: ${u.role}`));

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  } finally {
    // Always disconnect after tests are done to gracefully exit the script
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('👋 Disconnected from MongoDB.');
    }
    process.exit();
  }
};

runTests();
