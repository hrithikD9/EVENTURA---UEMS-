#!/bin/bash

# Script to start the Eventura backend server
# Author: Eventura Team
# Usage: bash start_server.sh

# Navigate to the backend directory
cd "$(dirname "$0")/backend" || {
  echo "❌ Failed to navigate to backend directory"
  exit 1
}

# Check if backend directory exists
if [ ! -d "$(pwd)" ]; then
  echo "❌ Backend directory not found"
  exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
  echo "❌ server.js not found in backend directory"
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  exit 1
fi

# Check if the server is already running
if pgrep -f "node.*server.js" > /dev/null; then
  echo "✅ Eventura backend server is already running"
  
  # Get the process ID and port
  SERVER_PID=$(pgrep -f "node.*server.js")
  echo "🔍 Process ID: $SERVER_PID"
  echo "🔄 To restart the server, run: kill $SERVER_PID && bash start_server.sh"
  exit 0
fi

# Start the server
echo "🚀 Starting Eventura backend server..."
node server.js
