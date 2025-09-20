#!/usr/bin/env node

/**
 * Data Verification Script
 * Verifies that all data has been successfully cleared
 */

const mongoose = require('mongoose');
const memoryStore = require('../utils/memoryStore');

async function verifyDataCleared() {
  try {
    console.log('🔍 Verifying data cleanup...\n');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/tourist-safety-db');
    
    // Check database collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Database Status:');
    console.log(`   Collections found: ${collections.length}`);
    if (collections.length === 0) {
      console.log('   ✅ Database is completely clean');
    } else {
      console.log('   Collections:', collections.map(c => c.name).join(', '));
    }
    
    // Check memory store
    console.log('\n💾 Memory Store Status:');
    console.log(`   Users in memory: ${memoryStore.users.length}`);
    console.log(`   Next ID counter: ${memoryStore.nextId}`);
    
    if (memoryStore.users.length === 0 && memoryStore.nextId === 1) {
      console.log('   ✅ Memory store is completely clean');
    }
    
    console.log('\n🎯 VERIFICATION SUMMARY:');
    console.log('========================');
    const dbClean = collections.length === 0;
    const memoryClean = memoryStore.users.length === 0;
    
    if (dbClean && memoryClean) {
      console.log('✅ ALL DATA SUCCESSFULLY CLEARED!');
      console.log('🚀 System ready for fresh presentation');
    } else {
      console.log('⚠️  Some data may still exist:');
      if (!dbClean) console.log('   - Database not completely clean');
      if (!memoryClean) console.log('   - Memory store not completely clean');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

verifyDataCleared().catch(console.error);
