#!/bin/bash

echo "🧪 Testing Smart Tourist Safety System API..."
echo ""

# Start server in background
echo "🚀 Starting server..."
cd /home/DevCrewX/Projects/sih/2/smart-tourist-safety-system/backend
node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "✅ Server started! Testing endpoints..."
echo ""

# Test health endpoint
echo "1. Testing Health Check:"
curl -s http://localhost:5000/api/health | head -c 200
echo ""
echo ""

# Test registration endpoint (will show database connection status)
echo "2. Testing Registration Endpoint:"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"1234567890"}')
echo "$REGISTER_RESPONSE"
echo ""

# Extract token from registration response for login test
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "3. Testing Login Endpoint:"
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
echo ""
echo ""

echo "4. Testing Get All Users:"
curl -s http://localhost:5000/api/auth/users
echo ""
echo ""

echo "🌐 Open your browser and visit: http://localhost:5000"
echo ""
echo "🛑 To stop the server, run: kill $SERVER_PID"
echo "📖 Check the server logs above for any database connection messages"
