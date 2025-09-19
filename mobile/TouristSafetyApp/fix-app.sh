#!/bin/bash

echo "🔧 Fixing RakshaSetu App Registration..."

# 1. Kill any running Metro processes
pkill -f metro

# 2. Clean all caches
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf $TMPDIR/react-*

# 3. Clean Android build
cd android && ./gradlew clean && cd ..

# 4. Clean watchman (if available)
watchman watch-del-all 2>/dev/null || true

# 5. Reset Metro cache and start
echo "🚀 Starting Metro with reset cache..."
npx react-native start --reset-cache

echo "✅ Metro started! In another terminal run: npx react-native run-android"
