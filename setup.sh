#!/bin/bash

echo "🚀 Setting up Smart Tourist Safety System..."

# Navigate to project directory
cd /home/DevCrewX/Projects/sih/2/smart-tourist-safety-system

# Initialize git repository
echo "📦 Initializing git repository..."
git init
git add .
git commit -m "Initial project setup"

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Create GitHub repository and push this code"
echo "2. Run 'npm run dev' in backend folder to start development server"
echo "3. Start building your MVP features"
echo ""
echo "📚 Check GETTING_STARTED.md for detailed instructions"
