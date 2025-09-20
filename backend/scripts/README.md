# Data Management Scripts

This directory contains scripts for managing data in the Smart Tourist Safety System.

## Scripts Available

### 1. Clear Data Script (`clear-data.js`)
Completely clears all user data and resets the system for a fresh start.

**What it clears:**
- MongoDB database (all user collections)
- In-memory user store
- User names, emails, phone numbers
- Emergency contact information
- Digital IDs
- Location tracking data

**Usage:**
```bash
node scripts/clear-data.js
# OR
npm run clear-data
```

### 2. Verify Cleanup Script (`verify-cleanup.js`)
Verifies that all data has been successfully cleared from the system.

**Usage:**
```bash
node scripts/verify-cleanup.js
# OR
npm run verify-cleanup
```

### 3. Fresh Start (Combined Script)
Runs both clear-data and verify-cleanup scripts in sequence.

**Usage:**
```bash
npm run fresh-start
```

## When to Use

### Before Presentations
Run `npm run fresh-start` to ensure a completely clean system with no existing user data.

### After Testing
Run `npm run clear-data` to remove test data and start fresh.

### Data Verification
Run `npm run verify-cleanup` to confirm the system is clean.

## Important Notes

⚠️ **Warning**: These scripts will permanently delete all user data. Use with caution!

💡 **In-Memory Data**: The socket.io in-memory storage (emergencyAlerts, userLocations, connectedUsers) is automatically cleared when the server restarts.

🔄 **Server Restart**: After running cleanup scripts, restart the server to ensure all in-memory data is also cleared:
```bash
npm run dev  # or npm start
```

## System Status After Cleanup

✅ Database completely empty  
✅ No user accounts exist  
✅ No emergency contacts stored  
✅ No location tracking data  
✅ No digital IDs assigned  
✅ Fresh system ready for demo
