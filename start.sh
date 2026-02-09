#!/bin/bash

# RoomSearch Backend Quick Start Script

echo "🚀 Starting RoomSearch Backend..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    # Try to start MongoDB with Homebrew
    if command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data
    else
        # Start MongoDB manually
        mkdir -p /tmp/mongodb-data
        mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data
    fi
    sleep 2
    echo "✅ MongoDB started"
else
    echo "✅ MongoDB is already running"
fi

echo ""
echo "🔧 Starting Node.js server..."
echo ""

# Start the Node.js server
npm run dev
