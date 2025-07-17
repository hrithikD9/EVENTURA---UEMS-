#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}      Eventura Backend Starter${NC}"
echo -e "${BLUE}======================================${NC}"

# Navigate to the backend directory
cd "$(dirname "$0")/backend" || {
  echo -e "${RED}Failed to find backend directory!${NC}"
  echo -e "${YELLOW}This script should be run from the Eventura root folder.${NC}"
  exit 1
}

echo -e "${GREEN}✓${NC} Found backend directory"

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed!${NC}"
  echo "Please install Node.js from https://nodejs.org/"
  exit 1
fi

echo -e "${GREEN}✓${NC} Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm is not installed!${NC}"
  echo "Please install npm (it typically comes with Node.js)"
  exit 1
fi

echo -e "${GREEN}✓${NC} npm is installed: $(npm --version)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo -e "${RED}package.json not found!${NC}"
  echo -e "${YELLOW}Make sure you're running this script from the backend directory.${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Found package.json"

# Check if node_modules exists, if not, install dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
  npm install

  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies!${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓${NC} Dependencies installed"

# Check if MongoDB is running (simplified check)
echo -e "${YELLOW}Checking if MongoDB is available...${NC}"
# This is a simplified check and might not work in all environments
# A more robust check would involve actually connecting to MongoDB
if command -v mongod &> /dev/null; then
  echo -e "${GREEN}✓${NC} MongoDB found on system"
else
  echo -e "${YELLOW}⚠ Could not verify MongoDB installation.${NC}"
  echo -e "${YELLOW}The server might fail if MongoDB is not running.${NC}"
fi

# Start the server
echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}      Starting Eventura Backend${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Server will start on http://localhost:5000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"

# Start the server
node server.js
