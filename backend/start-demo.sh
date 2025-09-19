#!/bin/bash

# 🎯 SIH 2025 - Quick Demo Setup Script
# Smart Tourist Safety System

echo "🚀 Starting Smart Tourist Safety System Demo Setup..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in backend directory"
    echo "Please run from: /home/DevCrewX/Projects/sih/2/smart-tourist-safety-system/backend"
    exit 1
fi

echo "📂 Current directory: $(pwd)"

# Start the backend server
echo ""
echo "🔧 Starting Backend Server..."
echo "🌐 Server will run on: http://localhost:5000"
echo "🔌 Socket.IO server will be ready for real-time connections"
echo ""

# Show what will be started
echo "📋 Services starting:"
echo "  ✅ Node.js + Express.js backend"
echo "  ✅ MongoDB database connection"
echo "  ✅ Socket.IO WebSocket server"
echo "  ✅ REST API endpoints"
echo "  ✅ Real-time monitoring dashboard"
echo ""

echo "🎬 Demo URLs ready:"
echo "  📊 API Health: http://localhost:5000/api/health"
echo "  🖥️  Monitoring: http://localhost:5000/monitoring.html"
echo "  📱 Socket Test: node test-socket.js"
echo ""

echo "⏰ Starting server in 3 seconds..."
sleep 1
echo "⏰ Starting server in 2 seconds..."
sleep 1
echo "⏰ Starting server in 1 second..."
sleep 1

echo ""
echo "🚀 LAUNCHING SMART TOURIST SAFETY SYSTEM..."
echo ""

# Start the server
cd /home/DevCrewX/Projects/sih/2/smart-tourist-safety-system/backend
node server.js
