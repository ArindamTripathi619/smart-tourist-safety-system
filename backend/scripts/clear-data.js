#!/usr/bin/env node

/**
 * Data Cleanup Script for Fresh Presentation Start
 * Clears all user data, emergency alerts, and tracking logs
 */

const mongoose = require('mongoose');
const path = require('path');

// Import models and utilities
const dbConfig = require('../config/database');
const memoryStore = require('../utils/memoryStore');

async function clearAllData() {
  try {
    console.log('🧹 Starting complete data cleanup for fresh presentation...\n');
    
    // 1. Clear MongoDB Database
    console.log('1. Clearing MongoDB Database...');
    await mongoose.connect('mongodb://localhost:27017/tourist-safety-db');
    
    // Drop the entire database to ensure complete cleanup
    await mongoose.connection.db.dropDatabase();
    console.log('   ✅ MongoDB database completely cleared');
    
    // 2. Clear In-Memory User Store
    console.log('\n2. Clearing In-Memory User Store...');
    memoryStore.users.length = 0; // Clear the users array
    memoryStore.nextId = 1; // Reset ID counter
    console.log('   ✅ In-memory user store cleared');
    
    // 3. Display cleanup summary
    console.log('\n🎉 CLEANUP COMPLETE - READY FOR FRESH PRESENTATION!');
    console.log('==========================================');
    console.log('✅ All user data cleared (names, emails, phones)');
    console.log('✅ All emergency contact information removed');
    console.log('✅ All location tracking data cleared');
    console.log('✅ All digital IDs reset');
    console.log('✅ In-memory storage cleared');
    console.log('✅ Database completely reset');
    console.log('\n💡 Note: In-memory alert storage (emergencyAlerts, userLocations,');
    console.log('   connectedUsers) will be automatically cleared when server restarts.');
    console.log('\n🚀 System is now ready for a fresh presentation demo!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  clearAllData().catch(console.error);
}

module.exports = clearAllData;
