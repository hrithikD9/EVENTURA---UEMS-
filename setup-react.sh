#!/bin/bash

# Eventura React Setup Script

echo "🎉 Setting up Eventura React Application..."
echo ""

# Navigate to client directory
cd client || { echo "❌ Error: client directory not found"; exit 1; }

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "📝 Demo Login Credentials:"
echo "   Email: john@neub.edu.bd"
echo "   Password: password123"
echo ""

# Start the dev server
npm run dev
